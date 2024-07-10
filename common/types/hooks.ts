import {CardInstance, StatusEffectInstance} from './game-state'

export class Hook<Listener, Args extends (...args: any) => any> {
	public listeners: Array<[Listener, Args]> = []
	private eq: (a: Listener, b: Listener) => boolean = (a, b) => a == b

	public constructor(eq?: (a: Listener, b: Listener) => boolean) {
		this.eq = eq || this.eq
	}

	/**
	 * Adds a new listener to this hook
	 */
	public add(listener: Listener, call: Args) {
		this.listeners.push([listener, call])
	}

	/**
	 * Adds a new listener to this hook before any other existing listeners
	 */
	public addBefore(listener: Listener, call: Args) {
		this.listeners.unshift([listener, call])
	}

	/**
	 * Removes all the listeners tied to a specific instance
	 */
	public remove(listener: Listener) {
		this.listeners = this.listeners.filter(([hookListener, _]) => !this.eq(hookListener, listener))
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
export class GameHook<Args extends (...args: any) => any> extends Hook<
	CardInstance | StatusEffectInstance,
	Args
> {
	constructor() {
		// We override the eq function because card and status instances can not be compared with the regular === operator.
		super((a, b) => a.id == b.id)
	}

	/**
	 * Calls only the listeners belonging to instances that pass the predicate
	 */
	public callSome(
		params: Parameters<Args>,
		predicate: (instance: CardInstance | StatusEffectInstance) => boolean
	) {
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
	Args extends (...args: any) => Parameters<Args>[0]
> extends GameHook<Args> {
	public override call(...params: Parameters<Args>): Parameters<Args>[0] {
		return this.listeners.reduce((params, [_, listener]) => {
			params[0] = listener(...(params as Array<any>))
			return params
		}, params)[0]
	}
}
