type KeysToStrings<T extends Record<number, any>> = {
	[Key in keyof T as Key & string]: T[Key]
}

export type Message<T extends Record<number, {type: string}>> = T[number]

type MessageTableInner<T extends Record<string, any>> = {
	[n in keyof KeysToStrings<T> as T[n]['type']]: T[n]
}

export type MessageTable<T extends Record<number, {type: string}>> =
	MessageTableInner<KeysToStrings<T>>

type MessageDict<T extends Array<string>> = {
	[Key in keyof {[n in keyof T as T[n] & string]: string}]: Key
}

export function messages<T extends Array<string>>(
	...actions: T
): MessageDict<T> {
	let actionsDict: Record<string, string> = {}
	for (const action of actions) {
		actionsDict[action] = action
	}
	return actionsDict as any
}
