import { InstanceBase, runEntrypoint, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { CalrecClient } from '@bitfocusas/calrec-cscp'
import { GetConfigFields, type CalrecConfig } from './config.js'
import { GetActions } from './actions.js'
import { GetFeedbacks } from './feedbacks.js'
import { GetPresets } from './presets.js'
import { setVariableWithDeclaration } from './variables.js'

interface FaderState {
	level: number
	levelDb: string
	isCut: boolean
	isPfl: boolean
	label: string
}

export class CalrecInstance extends InstanceBase<CalrecConfig> {
	public config!: CalrecConfig
	public client!: CalrecClient
	public faderStates: Map<number, FaderState> = new Map()
	public mainFaderStates: Map<number, { level: number; isPfl: boolean; label: string }> = new Map()
	public auxOutputLevels: Map<number, number> = new Map()
	public auxRouting: Map<number, boolean[]> = new Map()
	public mainRouting: Map<number, boolean[]> = new Map()
	public stereoImages: Map<number, { leftToBoth: boolean; rightToBoth: boolean }> = new Map()
	public faderAssignments: Map<number, unknown> = new Map()
	public availableAuxes: boolean[] = []
	public availableMains: boolean[] = []

	async init(config: CalrecConfig): Promise<void> {
		this.log('info', 'init() called')
		try {
			this.updateStatus(InstanceStatus.Connecting)
			await this.configUpdated(config)

			// Initialize module components
			this.setActionDefinitions(GetActions(this))
			this.setFeedbackDefinitions(GetFeedbacks(this))
			this.setPresetDefinitions(GetPresets(this))
			this.log('info', 'init() completed successfully')
		} catch (e: unknown) {
			this.log('error', `init() failed: ${e instanceof Error ? e.message : String(e)}`)
			throw e
		}
	}

	async destroy(): Promise<void> {
		if (this.client) {
			this.client.disconnect()
		}
		this.updateStatus(InstanceStatus.Disconnected)
		this.log('debug', 'destroy')
	}

	async configUpdated(config: CalrecConfig): Promise<void> {
		this.log('info', 'configUpdated() called')
		try {
			this.config = config
			this.updateStatus(InstanceStatus.Connecting)

			if (this.client) {
				this.client.disconnect()
			}

			this.client = new CalrecClient({
				host: this.config.host,
				port: this.config.port,
				maxFaderCount: 192,
				maxMainCount: 16,
			})

			this.setupEventListeners()

			try {
				await this.client.connect()
			} catch (e: unknown) {
				this.updateStatus(InstanceStatus.ConnectionFailure, 'Failed to connect')
				this.log('error', `Connection failed: ${e instanceof Error ? e.message : String(e)}`)
			}
			this.log('info', 'configUpdated() completed successfully')
		} catch (e: unknown) {
			this.log('error', `configUpdated() failed: ${e instanceof Error ? e.message : String(e)}`)
			throw e
		}
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private setupEventListeners(): void {
		this.log('info', 'setupEventListeners() called')
		try {
			this.client.on('connect', () => {
				this.log('info', 'Connected to Calrec console')
				this.updateStatus(InstanceStatus.Ok)
			})

			this.client.on('ready', async () => {
				this.log('info', 'Calrec console is ready')
				let availableAuxes = this.availableAuxes
				if (!availableAuxes || availableAuxes.length === 0) {
					await new Promise((resolve) => {
						const timeout = setTimeout(resolve, 2000)
						const handler = (auxes: boolean[]) => {
							availableAuxes = auxes
							clearTimeout(timeout)
							this.client.off('availableAuxesChange', handler)
							resolve(undefined)
						}
						this.client.on('availableAuxesChange', handler)
					})
				}
				if (!availableAuxes || availableAuxes.length === 0) {
					const fallbackCount = this.config.fallbackAuxCount ?? 16
					this.log('warn', `No available auxes detected, defaulting to ${fallbackCount}.`)
					availableAuxes = Array(fallbackCount).fill(true)
				}

				const maxFaders = this.config?.maxFaderCount ? this.config.maxFaderCount : 128
				const failedFaderCommands = new Set<string>()
				for (let i = 0; i < maxFaders; i++) {
					const labelKey = `label:${i}`
					if (failedFaderCommands.has(labelKey)) continue
					try {
						const label = await this.client.getFaderLabel(i)
						let labelStr: string
						if (typeof label === 'object' && label !== null && Buffer.isBuffer(label)) {
							const labelBuf = label as Buffer
							labelStr = labelBuf.slice(2).toString('ascii')
							this.log(
								'debug',
								`(ready/getFaderLabel) Fader ${i} label buffer (ascii): [${labelBuf.slice(2).toString('hex')}]`,
							)
						} else {
							labelStr = typeof label === 'string' ? label : String(label)
						}
						this.log('info', `Fader ${i + 1} label is ${labelStr}`)
						this.log(
							'debug',
							`(ready/getFaderLabel) Fader ${i + 1} label typeof: ${typeof label}, value: ${JSON.stringify(label)}`,
						)
						this.log('debug', `(ready/getFaderLabel) Fader ${i + 1} labelStr: ${JSON.stringify(labelStr)}`)
						const state = this.getOrInitFaderState(i)
						state.label = labelStr
						this.faderStates.set(i, state)
						// Set variables for this fader (using 1-based fader ID for UI)
						setVariableWithDeclaration(this, `fader_${i + 1}_label`, labelStr)
						setVariableWithDeclaration(this, `fader_${i + 1}_level`, state.level)
						setVariableWithDeclaration(this, `fader_${i + 1}_level_db`, state.levelDb)
						setVariableWithDeclaration(this, `fader_${i + 1}_pfl`, state.isPfl ? 'On' : 'Off')
						setVariableWithDeclaration(this, `fader_${i + 1}_cut`, state.isCut ? 'Cut' : 'On')
					} catch (e: unknown) {
						this.log(
							'error',
							`Failed to get label for fader ${i}: ${e instanceof Error ? e.message : String(e)}`,
						)
					}
				}
				this.log('info', 'setupEventListeners() ready handler completed')
			})

			// Fader state change event listeners
			this.client.on('faderLevelChange', async (faderId: number, level: number) => {
				this.log('debug', `Fader ${faderId + 1} level changed to ${level}`)
				const state = this.getOrInitFaderState(faderId)
				state.level = level
				// Convert level to dB for display
				try {
					const { channelLevelToDb } = await import('@bitfocusas/calrec-cscp')
					state.levelDb = channelLevelToDb(level).toFixed(1)
				} catch (e) {
					state.levelDb = '-∞'
				}
				this.faderStates.set(faderId, state)
				// Update variables (using 1-based fader ID for UI)
				setVariableWithDeclaration(this, `fader_${faderId + 1}_level`, level)
				setVariableWithDeclaration(this, `fader_${faderId + 1}_level_db`, state.levelDb)
				this.checkFeedbacks('fader_cut_state', 'fader_pfl_state')
			})

			this.client.on('faderCutChange', (faderId: number, isCut: boolean) => {
				this.log('debug', `Fader ${faderId + 1} cut state changed to ${isCut}`)
				const state = this.getOrInitFaderState(faderId)
				state.isCut = isCut
				this.faderStates.set(faderId, state)
				// Update variables (using 1-based fader ID for UI)
				setVariableWithDeclaration(this, `fader_${faderId + 1}_cut`, isCut ? 'Cut' : 'On')
				this.checkFeedbacks('fader_cut_state', 'fader_pfl_state')
			})

			this.client.on('faderPflChange', (faderId: number, isPfl: boolean) => {
				this.log('debug', `Fader ${faderId + 1} PFL state changed to ${isPfl}`)
				const state = this.getOrInitFaderState(faderId)
				state.isPfl = isPfl
				this.faderStates.set(faderId, state)
				// Update variables (using 1-based fader ID for UI)
				setVariableWithDeclaration(this, `fader_${faderId + 1}_pfl`, isPfl ? 'On' : 'Off')
				this.checkFeedbacks('fader_cut_state', 'fader_pfl_state')
			})

			this.client.on('faderLabelChange', (faderId: number, label: string) => {
				this.log('debug', `Fader ${faderId + 1} label changed to ${label}`)
				const state = this.getOrInitFaderState(faderId)
				state.label = label
				this.faderStates.set(faderId, state)
				// Update variables (using 1-based fader ID for UI)
				setVariableWithDeclaration(this, `fader_${faderId + 1}_label`, label)
			})

			this.log('info', 'setupEventListeners() completed')
		} catch (e: unknown) {
			this.log('error', `setupEventListeners() failed: ${e instanceof Error ? e.message : String(e)}`)
			throw e
		}
	}

	private getOrInitFaderState(faderId: number): FaderState {
		let state = this.faderStates.get(faderId)
		if (!state) {
			state = {
				level: 0,
				levelDb: '-∞',
				isCut: false,
				isPfl: false,
				label: '',
			}
			this.faderStates.set(faderId, state)
		}
		return state
	}
}

runEntrypoint(CalrecInstance, [])
