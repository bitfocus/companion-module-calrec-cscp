import { InstanceBase, InstanceStatus, runEntrypoint, type SomeCompanionConfigField } from '@companion-module/base'
import { GetActions } from './actions.js'
import { CalrecApi, type CalrecApiHost } from './api.js'
import { GetConfigFields, type CalrecConfig } from './config.js'
import { PFL_UNKNOWN } from './constants.js'
import { GetFeedbacks } from './feedbacks.js'
import { GetPresets } from './presets.js'
import { UpgradeScripts } from './upgrades.js'
import { describeError } from './util.js'
import { faderVariableId, VariableStore, type VariableValue } from './variables.js'

export class CalrecInstance extends InstanceBase<CalrecConfig> implements CalrecApiHost {
	public config!: CalrecConfig

	private readonly variables = new VariableStore(this)
	public readonly api = new CalrecApi(this)

	/** Fader count the current definitions, -1 until the first build. */
	private definitionsFaderCount = -1

	// --- Companion lifecycle -------------------------------------------------

	async init(config: CalrecConfig): Promise<void> {
		this.updateStatus(InstanceStatus.Connecting)
		try {
			await this.configUpdated(config)
		} catch (error: unknown) {
			this.log('error', `Unable to init module: ${describeError(error)}`)
			throw error
		}
	}

	async configUpdated(config: CalrecConfig): Promise<void> {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		this.api.disconnect()
		this.api.configure(config)
		this.variables.reset()

		this.refreshDefinitions(this.api.getMaxFaderCount())
		this.api.connect()
	}

	async destroy(): Promise<void> {
		this.api.disconnect()
		this.variables.reset()
		this.updateStatus(InstanceStatus.Disconnected)
		this.log('debug', 'destroy')
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	// --- CalrecApiHost -------------------------------------------------------

	setVariable(variableId: string, value: VariableValue): void {
		this.variables.set(variableId, value)
	}

	onFaderCountChanged(faderCount: number): void {
		this.refreshDefinitions(faderCount)
	}

	private refreshDefinitions(faderCount: number): void {
		if (faderCount !== this.definitionsFaderCount) {
			this.definitionsFaderCount = faderCount
			this.setActionDefinitions(GetActions(this))
			this.setFeedbackDefinitions(GetFeedbacks(this))
			this.setPresetDefinitions(GetPresets(this))
		}
		this.variables.declareFaderVariables(faderCount)
		this.publishUnknownPflVariables(faderCount)
	}

	/** Marks PFL as unknown for every fader the desk has not pushed a state for yet. */
	private publishUnknownPflVariables(faderCount: number): void {
		for (let faderId = 0; faderId < faderCount; faderId++) {
			if (this.api.getFaderPfl(faderId) === null) {
				this.variables.set(faderVariableId(faderId, 'pfl'), PFL_UNKNOWN)
			}
		}
	}
}

runEntrypoint(CalrecInstance, UpgradeScripts)
