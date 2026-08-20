import type {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldNumber,
	CompanionOptionValues,
} from '@companion-module/base'
import {
	CHANNEL_FADER_MAX_DB,
	CHANNEL_FADER_MIN_DB,
	MAX_ADDRESSABLE_FADER_COUNT,
	MAX_PROTOCOL_LEVEL,
	MIN_PROTOCOL_LEVEL,
} from './constants.js'

export const TOGGLE_STATES = ['on', 'off', 'toggle'] as const
export type ToggleState = (typeof TOGGLE_STATES)[number]
export function isToggleState(value: unknown): value is ToggleState {
	return typeof value === 'string' && (TOGGLE_STATES as readonly string[]).includes(value)
}

export const DEFAULT_FADER_NUMBER = 1
export const DEFAULT_PROTOCOL_LEVEL = 768
export const DEFAULT_LEVEL_DB = 0
export const DEFAULT_STEP_DB = 1

const MIN_STEP_DB = 0.1
const MAX_STEP_DB = 10

export function faderIdOption(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: 'Fader ID',
		id: 'faderId',
		default: DEFAULT_FADER_NUMBER,
		min: 1,
		max: MAX_ADDRESSABLE_FADER_COUNT,
	}
}

export function isMainOption(): CompanionInputFieldCheckbox {
	return { type: 'checkbox', label: 'Main', id: 'isMain', default: false }
}

export function protocolLevelOption(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: `Level (${MIN_PROTOCOL_LEVEL}-${MAX_PROTOCOL_LEVEL})`,
		id: 'level',
		default: DEFAULT_PROTOCOL_LEVEL,
		min: MIN_PROTOCOL_LEVEL,
		max: MAX_PROTOCOL_LEVEL,
		range: true,
	}
}

export function levelDbOption(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: 'Level (dB)',
		id: 'levelDb',
		default: DEFAULT_LEVEL_DB,
		min: CHANNEL_FADER_MIN_DB,
		max: CHANNEL_FADER_MAX_DB,
	}
}

export function stepDbOption(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: 'Step (dB)',
		id: 'stepDb',
		default: DEFAULT_STEP_DB,
		min: MIN_STEP_DB,
		max: MAX_STEP_DB,
	}
}

export function toggleStateOption(onLabel: string, offLabel: string): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: 'toggle',
		choices: [
			{ id: 'on', label: onLabel },
			{ id: 'off', label: offLabel },
			{ id: 'toggle', label: 'Toggle' },
		],
	}
}

export function readNumber(options: CompanionOptionValues, id: string, fallback: number): number {
	const value = Number(options[id])
	return Number.isFinite(value) ? value : fallback
}

/** Converts Companion's 1-based fader number to the library's 0-based id. */
export function readFaderId(options: CompanionOptionValues): number {
	return readNumber(options, 'faderId', DEFAULT_FADER_NUMBER) - 1
}

export function readBoolean(options: CompanionOptionValues, id: string): boolean {
	return options[id] === true
}

export function readToggleState(options: CompanionOptionValues, id: string): ToggleState {
	const value = options[id]
	return isToggleState(value) ? value : 'toggle'
}
