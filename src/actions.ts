import type { CompanionActionDefinitions } from '@companion-module/base'
import type { CalrecInstance } from './main.js'
import {
	DEFAULT_LEVEL_DB,
	DEFAULT_PROTOCOL_LEVEL,
	DEFAULT_STEP_DB,
	faderIdOption,
	isMainOption,
	levelDbOption,
	protocolLevelOption,
	readBoolean,
	readFaderId,
	readNumber,
	readToggleState,
	stepDbOption,
	toggleStateOption,
} from './options.js'

export function GetActions(instance: CalrecInstance): CompanionActionDefinitions {
	return {
		set_fader_level_unified: {
			name: 'Set Fader Level (0-1023)',
			options: [faderIdOption(), isMainOption(), protocolLevelOption()],
			callback: async ({ options }) => {
				const faderId = readFaderId(options)
				const level = readNumber(options, 'level', DEFAULT_PROTOCOL_LEVEL)

				if (readBoolean(options, 'isMain')) {
					await instance.api.setMainFaderLevel(faderId, level)
				} else {
					// Queued — the send, and any failure, is logged when it goes out.
					instance.api.setFaderLevel(faderId, level)
				}
			},
		},

		set_fader_level_db_unified: {
			name: 'Set Fader Level (dB)',
			options: [faderIdOption(), isMainOption(), levelDbOption()],
			callback: async ({ options }) => {
				const faderId = readFaderId(options)
				const levelDb = readNumber(options, 'levelDb', DEFAULT_LEVEL_DB)

				if (readBoolean(options, 'isMain')) {
					await instance.api.setMainFaderLevelDb(faderId, levelDb)
				} else {
					// Queued — the send, and any failure, is logged when it goes out.
					instance.api.setFaderLevelDb(faderId, levelDb)
				}
			},
		},

		set_fader_pfl_unified: {
			name: 'Set Fader PFL',
			options: [faderIdOption(), isMainOption(), toggleStateOption('On (PFL)', 'Off (Not PFL)')],
			callback: async ({ options }) => {
				const faderId = readFaderId(options)
				const state = readToggleState(options, 'state')

				if (readBoolean(options, 'isMain')) {
					await instance.api.setMainFaderPfl(faderId, state)
				} else {
					await instance.api.setFaderPfl(faderId, state)
				}
			},
		},

		set_fader_cut_unified: {
			name: 'Set Fader Cut',
			options: [faderIdOption(), toggleStateOption('On (Cut)', 'Off (Not Cut)')],
			callback: async ({ options }) => {
				await instance.api.setFaderCut(readFaderId(options), readToggleState(options, 'state'))
			},
		},

		fader_level_up: {
			name: 'Fader Level Up (dB)',
			options: [faderIdOption(), stepDbOption()],
			callback: ({ options }) => {
				// Queued — the send, and any failure, is logged when it goes out.
				instance.api.adjustFaderLevelDb(readFaderId(options), readNumber(options, 'stepDb', DEFAULT_STEP_DB))
			},
		},

		fader_level_down: {
			name: 'Fader Level Down (dB)',
			options: [faderIdOption(), stepDbOption()],
			callback: ({ options }) => {
				// Queued — the send, and any failure, is logged when it goes out.
				instance.api.adjustFaderLevelDb(readFaderId(options), -readNumber(options, 'stepDb', DEFAULT_STEP_DB))
			},
		},
	}
}
