import type { CalrecInstance } from './main.js'
import { CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { MAX_FADERS } from './variables.js'

export function GetFeedbacks(instance: CalrecInstance): CompanionFeedbackDefinitions {
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
					default: 0,
					min: 0,
					max: MAX_FADERS,
				},
			],
			callback: (feedback) => {
				const faderId = Number(feedback.options.faderId)
				return instance.faderStates.get(faderId)?.isCut ?? false
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
					default: 0,
					min: 0,
					max: MAX_FADERS,
				},
			],
			callback: (feedback) => {
				const faderId = Number(feedback.options.faderId)
				return instance.faderStates.get(faderId)?.isPfl ?? false
			},
		},
	}
}