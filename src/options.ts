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

export const FADE_TARGET_MODES = ['absolute', 'relative'] as const
export type FadeTargetMode = (typeof FADE_TARGET_MODES)[number]

export const FADE_SPEED_MODES = ['rate', 'duration'] as const
export type FadeSpeedMode = (typeof FADE_SPEED_MODES)[number]

export const DEFAULT_FADER_NUMBER = 1
export const DEFAULT_PROTOCOL_LEVEL = 768
export const DEFAULT_LEVEL_DB = 0
export const DEFAULT_STEP_DB = 1
export const DEFAULT_FADE_DELTA_DB = -10
export const DEFAULT_FADE_RATE_DB_PER_SEC = 5
export const DEFAULT_FADE_DURATION_SEC = 3

const MIN_STEP_DB = 0.1
const MAX_STEP_DB = 10
const MIN_FADE_RATE_DB_PER_SEC = 0.1
const MAX_FADE_RATE_DB_PER_SEC = 200
const MAX_FADE_DURATION_SEC = 600
const FADE_DELTA_RANGE_DB = CHANNEL_FADER_MAX_DB - CHANNEL_FADER_MIN_DB

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

export function fadeTargetModeOption(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Target',
		id: 'targetMode',
		default: 'absolute',
		choices: [
			{ id: 'absolute', label: 'Fade to level' },
			{ id: 'relative', label: 'Fade by amount' },
		],
	}
}

export function fadeLevelDbOption(): CompanionInputFieldNumber {
	return { ...levelDbOption(), isVisibleExpression: `$(options:targetMode) == 'absolute'` }
}

export function fadeDeltaDbOption(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: 'Amount (dB, negative fades down)',
		id: 'deltaDb',
		default: DEFAULT_FADE_DELTA_DB,
		min: -FADE_DELTA_RANGE_DB,
		max: FADE_DELTA_RANGE_DB,
		isVisibleExpression: `$(options:targetMode) == 'relative'`,
	}
}

export function fadeSpeedModeOption(): CompanionInputFieldDropdown {
	return {
		type: 'dropdown',
		label: 'Speed',
		id: 'speedMode',
		default: 'rate',
		choices: [
			{ id: 'rate', label: 'Fixed rate (dB per second)' },
			{ id: 'duration', label: 'Fixed duration (seconds)' },
		],
	}
}

export function fadeRateOption(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: 'Rate (dB per second)',
		id: 'rateDbPerSec',
		default: DEFAULT_FADE_RATE_DB_PER_SEC,
		min: MIN_FADE_RATE_DB_PER_SEC,
		max: MAX_FADE_RATE_DB_PER_SEC,
		isVisibleExpression: `$(options:speedMode) == 'rate'`,
	}
}

export function fadeDurationOption(): CompanionInputFieldNumber {
	return {
		type: 'number',
		label: 'Duration (seconds)',
		id: 'durationSec',
		default: DEFAULT_FADE_DURATION_SEC,
		min: 0,
		max: MAX_FADE_DURATION_SEC,
		isVisibleExpression: `$(options:speedMode) == 'duration'`,
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

export function readFadeTargetMode(options: CompanionOptionValues): FadeTargetMode {
	return options.targetMode === 'relative' ? 'relative' : 'absolute'
}

export function readFadeSpeedMode(options: CompanionOptionValues): FadeSpeedMode {
	return options.speedMode === 'duration' ? 'duration' : 'rate'
}
