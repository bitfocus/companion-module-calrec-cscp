import { combineRgb, type CompanionFeedbackDefinitions, type CompanionInputFieldNumber } from '@companion-module/base'
import type { CalrecInstance } from './main.js'
import { faderIdOption, readFaderId } from './options.js'

export function GetFeedbacks(instance: CalrecInstance): CompanionFeedbackDefinitions {
	// Feedbacks only offer faders this console actually has; definitions are rebuilt
	// whenever the effective count changes.
	const faderPicker: CompanionInputFieldNumber = {
		...faderIdOption(),
		max: Math.max(1, instance.api.getMaxFaderCount()),
	}

	return {
		fader_cut_state: {
			type: 'boolean',
			name: 'Fader Cut State',
			description: 'Change style if a fader is cut (muted)',
			defaultStyle: {
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(255, 0, 0),
			},
			options: [faderPicker],
			callback: ({ options }) => instance.api.isFaderCut(readFaderId(options)),
		},
		fader_pfl_state: {
			type: 'boolean',
			name: 'Fader PFL State',
			description: 'Change style if a fader has PFL active',
			defaultStyle: {
				color: combineRgb(0, 0, 0),
				bgcolor: combineRgb(255, 255, 0),
			},
			options: [faderPicker],
			// Unknown PFL reads as inactive; the desk only reports PFL when it changes.
			callback: ({ options }) => instance.api.getFaderPfl(readFaderId(options)) === true,
		},
	}
}
