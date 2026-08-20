import { combineRgb, type CompanionButtonPresetDefinition } from '@companion-module/base'
import type { CalrecInstance } from './main.js'

const COLOR_BLACK = combineRgb(0, 0, 0)
const COLOR_WHITE = combineRgb(255, 255, 255)
const COLOR_PFL = combineRgb(0, 200, 0)
const COLOR_CUT = combineRgb(200, 0, 0)
const COLOR_DARK_GREY = combineRgb(30, 30, 30)

export function GetPresets(instance: CalrecInstance): {
	[id: string]: CompanionButtonPresetDefinition
} {
	const maxFaderCount = instance.api.getMaxFaderCount()
	const presets: { [id: string]: CompanionButtonPresetDefinition } = {}

	// Pad so categories sort numerically.
	const padWidth = String(maxFaderCount).length

	for (let faderNumber = 1; faderNumber <= maxFaderCount; faderNumber++) {
		const category = `Fader ${String(faderNumber).padStart(padWidth, '0')}`

		presets[`fader_${faderNumber}_label`] = {
			type: 'button',
			category,
			name: `Fader ${faderNumber} Label`,
			style: {
				text: `$(label:fader_${faderNumber}_label)`,
				size: '14',
				color: COLOR_WHITE,
				bgcolor: COLOR_DARK_GREY,
			},
			feedbacks: [],
			steps: [{ down: [], up: [] }],
		}

		presets[`fader_${faderNumber}_level`] = {
			type: 'button',
			category,
			name: `Fader ${faderNumber} Level`,
			style: {
				text: `$(label:fader_${faderNumber}_level_db)dB`,
				size: '18',
				color: COLOR_WHITE,
				bgcolor: COLOR_BLACK,
			},
			feedbacks: [],
			steps: [{ down: [], up: [] }],
		}

		presets[`fader_${faderNumber}_down3`] = {
			type: 'button',
			category,
			name: `Fader ${faderNumber} -3dB`,
			style: {
				text: '-3dB',
				size: '18',
				color: COLOR_WHITE,
				bgcolor: COLOR_BLACK,
			},
			feedbacks: [],
			steps: [
				{
					down: [{ actionId: 'fader_level_down', options: { faderId: faderNumber, stepDb: 3 } }],
					up: [],
				},
			],
		}

		presets[`fader_${faderNumber}_up3`] = {
			type: 'button',
			category,
			name: `Fader ${faderNumber} +3dB`,
			style: {
				text: '+3dB',
				size: '18',
				color: COLOR_WHITE,
				bgcolor: COLOR_BLACK,
			},
			feedbacks: [],
			steps: [
				{
					down: [{ actionId: 'fader_level_up', options: { faderId: faderNumber, stepDb: 3 } }],
					up: [],
				},
			],
		}

		presets[`fader_${faderNumber}_rotary`] = {
			type: 'button',
			category,
			name: `Fader ${faderNumber} Rotary`,
			previewStyle: {
				text: 'Level Adjust (Rotary Knob)',
				size: 12,
				color: COLOR_WHITE,
				bgcolor: COLOR_BLACK,
			},
			style: {
				text: `$(label:fader_${faderNumber}_level_db)dB`,
				size: '14',
				color: COLOR_WHITE,
				bgcolor: COLOR_BLACK,
			},
			options: { rotaryActions: true },
			feedbacks: [],
			steps: [
				{
					down: [],
					up: [],
					rotate_left: [{ actionId: 'fader_level_down', options: { faderId: faderNumber, stepDb: 1 } }],
					rotate_right: [{ actionId: 'fader_level_up', options: { faderId: faderNumber, stepDb: 1 } }],
				},
			],
		}

		presets[`fader_${faderNumber}_pfl`] = {
			type: 'button',
			category,
			name: `Fader ${faderNumber} PFL`,
			style: {
				text: 'PFL',
				size: '18',
				color: COLOR_WHITE,
				bgcolor: COLOR_BLACK,
			},
			feedbacks: [
				{ feedbackId: 'fader_pfl_state', options: { faderId: faderNumber }, style: { bgcolor: COLOR_PFL } },
			],
			steps: [
				{
					down: [{ actionId: 'set_fader_pfl_unified', options: { faderId: faderNumber, state: 'toggle' } }],
					up: [],
				},
			],
		}

		presets[`fader_${faderNumber}_cut`] = {
			type: 'button',
			category,
			name: `Fader ${faderNumber} Cut`,
			style: {
				text: 'CUT',
				size: '18',
				color: COLOR_WHITE,
				bgcolor: COLOR_BLACK,
			},
			feedbacks: [
				{ feedbackId: 'fader_cut_state', options: { faderId: faderNumber }, style: { bgcolor: COLOR_CUT } },
			],
			steps: [
				{
					down: [{ actionId: 'set_fader_cut_unified', options: { faderId: faderNumber, state: 'toggle' } }],
					up: [],
				},
			],
		}
	}

	return presets
}
