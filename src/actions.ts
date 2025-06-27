import type { CalrecInstance } from './main.js'
import { CompanionActionDefinitions } from '@companion-module/base'
import { MAX_FADERS } from './variables.js'

export function GetActions(instance: CalrecInstance): CompanionActionDefinitions {
	return {
		set_fader_cut: {
			name: 'Set Fader Cut (On/Off)',
			options: [
				{
					type: 'number',
					label: 'Fader ID',
					id: 'faderId',
					default: 0,
					min: 0,
					max: MAX_FADERS,
				},
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'On (Cut)' },
						{ id: 'off', label: 'Off (Not Cut)' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (action) => {
				const faderId = Number(action.options.faderId)
				let isCut: boolean
				if (action.options.state === 'toggle') {
					const currentState = instance.faderStates.get(faderId)?.isCut ?? false
					isCut = !currentState
				} else {
					isCut = action.options.state === 'on'
				}
			
				instance.client.setFaderCut(faderId, isCut).catch((e) => {
					instance.log('error', `Failed to set fader cut: ${e.message}`)
				})
				instance.log('info', `Set fader ${faderId} cut to ${isCut}`)
			},
		},
		/*set_fader_pfl: {
			name: 'Set Fader PFL',
			options: [
				{
					type: 'number',
					label: 'Fader ID',
					id: 'faderId',
					default: 0,
					min: 0,
					max: 255,
				},
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: 'toggle',
					choices: [
						{ id: 'on', label: 'On' },
						{ id: 'off', label: 'Off' },
						{ id: 'toggle', label: 'Toggle' },
					],
				},
			],
			callback: async (action) => {
				const faderId = Number(action.options.faderId)
				let isPfl: boolean
				if (action.options.state === 'toggle') {
					const currentState = instance.faderStates.get(faderId)?.isPfl ?? false
					isPfl = !currentState
				} else {
					isPfl = action.options.state === 'on'
				}
				// TODO: Implement proper method call when CalrecClient API is available
				// instance.client.setFaderPfl(faderId, isPfl).catch((e) => {
				// 	instance.log('error', `Failed to set fader PFL: ${e.message}`)
				// })
				instance.log('info', `Would set fader ${faderId} PFL to ${isPfl}`)
			},
		},*/
		set_fader_level: {
			name: 'Set Fader Level (0-1023)',
			options: [
				{
					type: 'number',
					label: 'Fader ID',
					id: 'faderId',
					default: 0,
					min: 0,
					max: 255,
				},
				{
					type: 'number',
					label: 'Level (0-1023)',
					id: 'level',
					default: 768,
					min: 0,
					max: 1023,
					range: true,
				},
			],
			callback: async (action) => {
				const faderId = Number(action.options.faderId)
				const level = Number(action.options.level)
				instance.client.setFaderLevel(faderId, level).catch((e) => {
					instance.log('error', `Failed to set fader level: ${e.message}`)
				})			
				instance.log('info', `Would set fader ${faderId} level to ${level}`)
			},
		},
		set_fader_level_db: {
			name: 'Set Fader Level (dB)',
			options: [
				{
					type: 'number',
					label: 'Fader ID',
					id: 'faderId',
					default: 0,
					min: 0,
					max: 255,
				},
				{
					type: 'number',
					label: 'Level (dB)',
					id: 'levelDb',
					default: 0,
					min: -90,
					max: 10,
				},
			],
			callback: async (action) => {
				const faderId = Number(action.options.faderId)
				const levelDb = Number(action.options.levelDb)
				instance.client.setFaderLevelDb(faderId, levelDb).catch((e) => {
					instance.log('error', `Failed to set fader level (dB): ${e.message}`)
				})
				instance.log('info', `Would set fader ${faderId} level to ${levelDb} dB`)
			},
		},
	}
}