import type { SomeCompanionConfigField } from '@companion-module/base'

export interface CalrecConfig {
	host: string
	port: number
	fallbackAuxCount?: number
	maxFaderCount?: number
	enableStereoWidthVariables?: boolean
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Target Port',
			width: 4,
			default: 23,
			min: 1,
			max: 65535,
		},
		{
			type: 'number',
			id: 'fallbackAuxCount',
			label: 'Fallback Aux Count (if autodetect fails)',
			width: 4,
			default: 16,
			min: 1,
			max: 32,
		},
		{
			type: 'number',
			id: 'maxFaderCount',
			label: 'Max Fader Count',
			width: 4,
			default: 128,
			min: 1,
			max: 128,
		},
		{
			type: 'checkbox',
			id: 'enableStereoWidthVariables',
			label: 'Enable Stereo Width Variables',
			default: true,
			width: 4,
		},
	]
}
