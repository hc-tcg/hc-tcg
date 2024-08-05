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

export type Action<
	T extends (...args: any) => Record<string, (...args: any) => {type: string}>,
> = ReturnType<ReturnType<T>[keyof ReturnType<T>]>

export type ActionTable<
	T extends (...args: any) => Record<string, (...args: any) => {type: string}>,
> = {
	[Prop in keyof ReturnType<T> as ReturnType<
		ReturnType<T>[Prop]
	>['type']]: ReturnType<ReturnType<T>[Prop]>
}
