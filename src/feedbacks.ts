import type { CalrecInstance } from './main.js'
import { type CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'

export function GetFeedbacks(instance: CalrecInstance): CompanionFeedbackDefinitions {
	const maxFaders = instance.config?.maxFaderCount ?? 128
	return {
		fader_cut_state: {
			type: 'boolean',
			name: 'Fader Cut State',
			description: 'Change style if a fader is cut (muted)',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			options: [
				{
					type: 'number',
					label: 'Fader ID',
					id: 'faderId',
					default: 1,
					min: 1,
					max: maxFaders + 1,
				},
			],
			callback: (feedback) => {
				const faderId = (feedback.options.faderId as number) - 1 // Convert from UI (1-based) to library (0-based)
				const state = instance.faderStates.get(faderId)
				return state ? state.isCut : false
			},
		},
		fader_pfl_state: {
			type: 'boolean',
			name: 'Fader PFL State',
			description: 'Change style if a fader has PFL active',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			options: [
				{
					type: 'number',
					label: 'Fader ID',
					id: 'faderId',
					default: 1,
					min: 1,
					max: maxFaders + 1,
				},
			],
			callback: (feedback) => {
				const faderId = (feedback.options.faderId as number) - 1 // Convert from UI (1-based) to library (0-based)
				const state = instance.faderStates.get(faderId)
				return state ? state.isPfl : false
			},
		},
	}
}
