import type { CompanionButtonPresetDefinition } from '@companion-module/base'
import type { CalrecInstance } from './main.js'

export function GetPresets(_instance: CalrecInstance): {
	[id: string]: CompanionButtonPresetDefinition
} {
	const presets: { [id: string]: CompanionButtonPresetDefinition } = {}

	return presets
}
