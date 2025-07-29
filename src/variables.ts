import type { CalrecInstance } from './main.js'

const declaredVariables = new WeakMap<CalrecInstance, Set<string>>()
const variableValuesCache = new WeakMap<CalrecInstance, { [variableId: string]: string | number | undefined }>()

export function setVariableWithDeclaration(
	instance: CalrecInstance,
	variableId: string,
	value: string | number | undefined,
): void {
	let declared = declaredVariables.get(instance)
	if (!declared) {
		declared = new Set()
		declaredVariables.set(instance, declared)
	}
	let cache = variableValuesCache.get(instance)
	if (!cache) {
		cache = {}
		variableValuesCache.set(instance, cache)
	}
	if (cache[variableId] === value) return // No change
	cache[variableId] = value
	if (!declared.has(variableId)) {
		declared.add(variableId)
		// Re-declare all variables with their names
		const variableDefinitions = Array.from(declared).map((id) => ({ variableId: id, name: id.replace(/_/g, ' ') }))
		instance.setVariableDefinitions(variableDefinitions)
	}
	instance.setVariableValues({ [variableId]: value })
}
