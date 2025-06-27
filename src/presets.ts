import { CompanionButtonPresetDefinition, combineRgb } from '@companion-module/base'

export function GetPresets(): { [id: string]: CompanionButtonPresetDefinition } {
	const presets: { [id: string]: CompanionButtonPresetDefinition } = {}

	// Generate presets for the first 16 faders for convenience
	for (let i = 0; i < 16; i++) {
		presets[`fader_${i}_cut_toggle`] = {
			type: 'button',
			category: 'Fader Controls',
			name: `Fader ${i} Cut Toggle`,
			style: {
				text: `CUT\\nFader ${i}\\n$(Calrec-CSCP:fader_${i}_cut)`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [{ actionId: 'set_fader_cut', options: { faderId: i, state: 'toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'fader_cut_state',
					options: { faderId: i },
					style: { bgcolor: combineRgb(255, 0, 0), color: combineRgb(255, 255, 255) },
				},
			],
		}

		presets[`fader_${i}_pfl_toggle`] = {
			type: 'button',
			category: 'Fader Controls',
			name: `Fader ${i} PFL Toggle`,
			style: {
				text: `PFL\\nFader ${i}\\n$(Calrec-CSCP:fader_${i}_pfl)`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [{ actionId: 'set_fader_pfl', options: { faderId: i, state: 'toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'fader_pfl_state',
					options: { faderId: i },
					style: { bgcolor: combineRgb(255, 255, 0), color: combineRgb(0, 0, 0) },
				},
			],
		}
	}

	return presets
}