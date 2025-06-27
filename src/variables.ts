import type { CalrecInstance } from './main.js'
import { CompanionVariableDefinition } from '@companion-module/base'

export const MAX_FADERS = 128 // Define variables for a generous number of faders

export function initVariables(instance: CalrecInstance): void {
	const variableDefinitions: CompanionVariableDefinition[] = []
	for (let i = 0; i < MAX_FADERS; i++) {
		variableDefinitions.push({ variableId: `fader_${i}_level`, name: `Fader ${i} Level (0-1023)` })
		variableDefinitions.push({ variableId: `fader_${i}_level_db`, name: `Fader ${i} Level (dB)` })
		variableDefinitions.push({ variableId: `fader_${i}_label`, name: `Fader ${i} Label`, })
		variableDefinitions.push({ variableId: `fader_${i}_pfl`, name: `Fader ${i} PFL State` })
		variableDefinitions.push({ variableId: `fader_${i}_cut`, name: `Fader ${i} Cut State` })
	}
	instance.setVariableDefinitions(variableDefinitions)
}

export function updateVariables(instance: CalrecInstance): void {
	const variableValues: { [variableId: string]: string | number | undefined } = {}

	for (const [faderId, state] of instance.faderStates.entries()) {
		if (faderId < MAX_FADERS) {
			variableValues[`fader_${faderId}_level`] = state.level
			variableValues[`fader_${faderId}_level_db`] = state.levelDb
			variableValues[`fader_${faderId}_label`] = state.label
			variableValues[`fader_${faderId}_pfl`] = state.isPfl ? 'On' : 'Off'
			variableValues[`fader_${faderId}_cut`] = state.isCut ? 'Cut' : 'On'
		}
	}

	instance.setVariableValues(variableValues)
}