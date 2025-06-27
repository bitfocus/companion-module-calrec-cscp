import {
	InstanceBase,
	runEntrypoint,
	InstanceStatus,
	SomeCompanionConfigField,
} from '@companion-module/base'
import { CalrecClient } from '@bitfocusas/calrec-cscp'
import { GetConfigFields, type CalrecConfig } from './config.js'
import { GetActions } from './actions.js'
import { GetFeedbacks } from './feedbacks.js'
import { updateVariables, initVariables, MAX_FADERS } from './variables.js'
import { GetPresets } from './presets.js'

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

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: CalrecConfig): Promise<void> {
		this.updateStatus(InstanceStatus.Connecting)
		await this.configUpdated(config)

		// Initialize module components
		initVariables(this)
		this.setActionDefinitions(GetActions(this))
		this.setFeedbackDefinitions(GetFeedbacks(this))
		this.setPresetDefinitions(GetPresets())

		updateVariables(this)
	}

	async destroy(): Promise<void> {
		if (this.client) {
			this.client.disconnect()
		}
		this.updateStatus(InstanceStatus.Disconnected)
		this.log('debug', 'destroy')
	}

	async configUpdated(config: CalrecConfig): Promise<void> {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		if (this.client) {
			this.client.disconnect()
		}

		this.client = new CalrecClient({
			host: this.config.host,
			port: this.config.port,
		})

		this.setupEventListeners()
		
		try {
			await this.client.connect()
		} catch (e: any) {
			this.updateStatus(InstanceStatus.ConnectionFailure, 'Failed to connect')
			this.log('error', `Connection failed: ${e.message}`)
		}
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private setupEventListeners(): void {
		this.client.on('connect', () => {
			this.updateStatus(InstanceStatus.Ok)
			this.log('info', 'Connected to Calrec console')
		})

		this.client.on('ready', () => {
			this.log('info', 'Calrec console is ready')
			// You could potentially fetch initial state here if the library supports it
		})

		this.client.on('error', (err) => {
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			this.log('error', `Socket Error: ${err.message}`)
		})

		this.client.on('disconnect', () => {
			this.updateStatus(InstanceStatus.Disconnected, 'Connection closed')
			this.log('info', 'Connection to Calrec console closed')
		})

		// Fader State Listeners
		this.client.on('faderLevelChange', (faderId, level) => {
			this.log('info', `Fader ${faderId} level changed to ${level}`)
			const state = this.getOrInitFaderState(faderId)
			state.level = level
			state.levelDb = this.levelToDb(level)
			this.faderStates.set(faderId, state)
			updateVariables(this)
		})

		this.client.on('faderCutChange', (faderId, isCut) => {
			this.log('info', `Fader ${faderId} cut changed to ${isCut}`)
			const state = this.getOrInitFaderState(faderId)
			state.isCut = isCut
			this.faderStates.set(faderId, state)
			this.checkFeedbacks('fader_cut_state')
			updateVariables(this)
		})

		this.client.on('faderPflChange', (faderId, isPfl) => {
			this.log('info', `Fader ${faderId} PFL changed to ${isPfl}`)
			const state = this.getOrInitFaderState(faderId)
			state.isPfl = isPfl
			this.faderStates.set(faderId, state)
			this.checkFeedbacks('fader_pfl_state')
			updateVariables(this)
		})

		this.client.on('faderLabelChange', (faderId, label) => {
			this.log('info', `Fader ${faderId} label changed to ${label}`)
			const state = this.getOrInitFaderState(faderId)
			state.label = label
			this.faderStates.set(faderId, state)
			updateVariables(this)
		})

		this.client.on('ready', async () => {
			for (let i = 0; i < MAX_FADERS; i++) {
				const label = await this.client.getFaderLabel(i)				
				this.log('info', `Fader ${i} label is ${label}`)
				const state = this.getOrInitFaderState(i)
				state.label = label.toString();
				this.faderStates.set(i, state)
				updateVariables(this)
			}
		})

	}

	private getOrInitFaderState(faderId: number): FaderState {
		let state = this.faderStates.get(faderId)
		if (!state) {
			state = {
				level: 0,
				levelDb: '-∞',
				isCut: false,
				isPfl: false,
				label: ``,
			}
			this.faderStates.set(faderId, state)
		}
		return state
	}

	private levelToDb(level: number): string {
		// Convert 0-1023 level to dB scale
		// Assuming 0 = -∞ dB, 1023 = +10 dB
		if (level === 0) return '-∞'
		
		// Convert to dB scale (0-1023 to -∞ to +10 dB)
		const dbValue = (level / 1023) * 10 - 60 // Scale to -60 to +10 dB range
		return dbValue.toFixed(1)
	}
}

runEntrypoint(CalrecInstance, [])