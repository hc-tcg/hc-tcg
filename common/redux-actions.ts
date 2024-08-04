type ActionsDict<T extends Array<string>> = {
	[n in keyof T as T[n] & string]: n & string
}

export function actions<T extends Array<string>>(
	...actions: T
): ActionsDict<T> {
	let actionsDict: Record<string, string> = {}
	for (const action in actions) {
		actionsDict[action] = action
	}
	return actionsDict as any
}
