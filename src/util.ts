/** Small pure helpers shared across the module. */

/** Turn anything thrown into a message safe to log. */
export function describeError(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

/** Format dB for display; avoids "-0.0" from tiny negative floats. */
export function formatDb(db: number): string {
	const rounded = Math.round(db * 10) / 10
	return (rounded === 0 ? 0 : rounded).toFixed(1)
}

/** Strip NULs/control chars; keep leading spaces (they are part of the desk label). */
export function sanitizeFaderLabel(label: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: matching control characters is the point
	return label.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+$/, '')
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value))
}

/** Clamp to an integer protocol level, tolerating the fractional values a number field can emit. */
export function clampToInteger(value: number, min: number, max: number): number {
	return clamp(Math.round(value), min, max)
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
