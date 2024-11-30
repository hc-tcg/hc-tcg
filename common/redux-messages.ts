type KeysToStrings<T extends Record<number, any>> = {
	[Key in keyof T as Key & string]: T[Key]
}

export type Message<T extends Record<number, {type: string}>> = T[number]

type MessageTableInner<T extends Record<string, any>> = {
	[n in keyof KeysToStrings<T> as T[n]['type']]: T[n]
}

export type MessageTable<T extends Record<number, {type: string}>> =
	MessageTableInner<KeysToStrings<T>>

type MessageDict<T extends Record<string, null>> = {
	[Key in keyof T]: Key
}

export function messages<T extends Record<string, null>>(
	groupName: string,
	actions: T,
): MessageDict<T> {
	let actionsDict: Record<string, string> = {}
	for (const action of Object.keys(actions)) {
		actionsDict[action] = `${groupName}-${action}`
	}
	return actionsDict as any
}
