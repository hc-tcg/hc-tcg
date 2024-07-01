import {CardInstance, StatusEffectInstance} from './game-state'

export class Hook<
	Args extends (...args: any) => any,
	Instance = CardInstance | StatusEffectInstance,
> {
	public listeners: Array<[any, Args]> = []

	/**
	 * Adds a new listener to this hook
	 */
	public add(instance: Instance, listener: Args) {
		this.listeners.push([instance, listener])
	}

	/**
	 * Adds a new listener to this hook before any other existing listeners
	 */
	public addBefore(instance: Instance, listener: Args) {
		this.listeners.unshift([instance, listener])
	}

	/**
	 * Removes all the listeners tied to a specific instance
	 */
	public remove(instance: Instance) {
		this.listeners = this.listeners.filter(([hookInstance, _]) => hookInstance == instance)
	}

	/**
	 * Calls all the added listeners. Returns an array of the results
	 */
	public call(...params: Parameters<Args>) {
		return this.listeners.map(([_, listener]) => listener(...(params as Array<any>)))
	}
}

/**
 * Custom hook class for the game, derived from the generic custom hook class.
 *
 * Allows adding and removing listeners with the card instance as a reference, and calling all or some of the listeners.
 */
export class GameHook<
	Args extends (...args: any) => any,
	Instance = CardInstance | StatusEffectInstance,
> extends Hook<Args, Instance> {
	/**
	 * Calls only the listeners belonging to instances that pass the predicate
	 */
	public callSome(params: Parameters<Args>, predicate: (instance: Instance) => boolean) {
		return this.listeners
			.filter(([instance, _]) => predicate(instance))
			.map(([_, listener]) => listener(...(params as Array<any>)))
	}
}

/**
 * Custom hook class that works the same as a regular hook, but also passes the first parameter through the listeners and returning it afterwards.
 *
 * Allows adding and removing listeners with the card instance as a reference, and calling all listeners while passing through the first parameter.
 */
export class WaterfallHook<
	Args extends (...args: any) => Parameters<Args>[0],
	Instance = CardInstance | StatusEffectInstance,
> extends Hook<Args, Instance> {
	public override call(...params: Parameters<Args>): Parameters<Args>[0] {
		return this.listeners.reduce((params, [_, listener]) => {
			params[0] = listener(...(params as Array<any>))
			return params
		}, params)[0]
	}
}
