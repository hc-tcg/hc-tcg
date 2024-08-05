type KeysToStrings<T extends Record<number, any>> = {
	[Key in keyof T as Key & string]: T[Key]
}

export type Action<T extends Record<number, {type: string}>> = T[number]

type ActionTableInner<T extends Record<string, any>> = {
	[n in keyof KeysToStrings<T> as T[n]['type']]: T[n]
}

export type ActionTable<T extends Record<number, {type: string}>> =
	ActionTableInner<KeysToStrings<T>>

type ActionsDict<T extends Array<string>> = {
	[Key in keyof {[n in keyof T as T[n] & string]: string}]: Key
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
