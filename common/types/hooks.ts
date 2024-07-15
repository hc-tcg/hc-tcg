import {CardComponent, StatusEffectComponent} from '../components'

type HookProxy = string & {__hook_proxy: never}

export class Hook<Listener, Args extends (...args: any) => any> {
	public listeners: Array<[Listener, Args, HookProxy]> = []
	private eq: (a: Listener, b: Listener) => boolean = (a, b) => a == b

	public constructor(eq?: (a: Listener, b: Listener) => boolean) {
		this.eq = eq || this.eq
	}

	/**
	 * Adds a new listener to this hook
	 */
	public add(listener: Listener, call: Args): HookProxy {
		let proxy = Math.random().toString() as HookProxy
		this.listeners.push([listener, call, proxy])
		return proxy
	}

	/**
	 * Adds a new listener to this hook before any other existing listeners
	 */
	public addBefore(listener: Listener, call: Args) {
		let proxy = Math.random().toString() as HookProxy
		this.listeners.unshift([listener, call, proxy])
		return proxy
	}

	/**
	 * Removes all the listeners tied to a specific instance
	 */
	public remove(listener: Listener) {
		this.listeners = this.listeners.filter(
			([hookListener, _args, _poxy]) => !this.eq(hookListener, listener)
		)
	}

	public removeWithHookProxy(proxy: HookProxy) {
		this.listeners = this.listeners.filter(
			([_listener, _args, targetProxy]) => targetProxy !== proxy
		)
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
	CardComponent | StatusEffectComponent,
	Args
> {
	constructor() {
		// We override the eq function because card and status instances can not be compared with the regular === operator.
		super((a, b) => a.entity == b.entity)
	}

	/**
	 * Calls only the listeners belonging to instances that pass the predicate
	 */
	public callSome(
		params: Parameters<Args>,
		predicate: (instance: CardComponent | StatusEffectComponent) => boolean
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
	Args extends (...args: any) => Parameters<Args>[0],
> extends GameHook<Args> {
	public override call(...params: Parameters<Args>): Parameters<Args>[0] {
		return this.listeners.reduce((params, [_, listener]) => {
			params[0] = listener(...(params as Array<any>))
			return params
		}, params)[0]
	}
}
