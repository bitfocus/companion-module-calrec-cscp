import { SomeCompanionConfigField } from '@companion-module/base'

export interface CalrecConfig {
	host: string
	port: number
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
	]
}