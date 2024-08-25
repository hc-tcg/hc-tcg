import type {ObserverEntity} from '../entities'
import {PrioritiesT, Priority, PriorityDict, PrioritySrc} from './priorities'

export class Hook<Listener extends any, Args extends (...args: any) => any> {
	public listeners: Array<[Listener, Args, string]> = []

	/**
	 * Adds a new listener to this hook
	 */
	public add(listener: Listener, call: Args) {
		let proxy = Math.random().toString()
		this.listeners.push([listener, call, proxy])
		return proxy
	}

	/**
	 * Adds a new listener to this hook before any other existing listeners
	 */
	public addBefore(listener: Listener, call: Args) {
		let proxy = Math.random().toString()
		this.listeners.unshift([listener, call, proxy])
		return proxy
	}

	/**
	 * Removes all the listeners tied to a specific instance
	 */
	public remove(listener: Listener) {
		this.listeners = this.listeners.filter(
			([hookListener, _func, _proxy]) => hookListener !== listener,
		)
	}

	public removeByProxy(proxy: string) {
		this.listeners = this.listeners.filter(
			([_hook, _func, funcProxy]) => proxy !== funcProxy,
		)
	}

	/**
	 * Calls all the added listeners. Returns an array of the results
	 */
	public call(...params: Parameters<Args>) {
		return this.listeners.map(([_, listener]) =>
			listener(...(params as Array<any>)),
		)
	}
}

/**
 * Custom hook class for the game, derived from the generic custom hook class.
 *
 * Allows adding and removing listeners with the card instance as a reference, and calling all or some of the listeners.
 */
export class GameHook<Args extends (...args: any) => any> extends Hook<
	ObserverEntity,
	Args
> {
	/**
	 * Calls only the listeners belonging to instances that pass the predicate
	 */
	public callSome(
		params: Parameters<Args>,
		predicate: (instance: ObserverEntity) => boolean,
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

	public override callSome(
		params: Parameters<Args>,
		predicate: (instance: ObserverEntity) => boolean,
	) {
		return this.listeners
			.filter(([instance, _]) => predicate(instance))
			.reduce((params, [_, listener]) => {
				params[0] = listener(...(params as Array<any>))
				return params
			}, params)[0]
	}
}

/**
 * Custom hook class that works the same as a regular game hook, but requires a listener's priority.
 *
 * Allows listeners to be called in a more deterministic order, neccessary when listeners are dependent on the execution of other listeners.
 */
export class PriorityHook<
	Args extends (...args: any) => any,
	Priorities extends PriorityDict<Src>,
	Src extends PrioritiesT = PrioritySrc<Priorities>,
> {
	public listeners: Array<
		[priority: number, instance: ObserverEntity, listener: Args]
	> = []

	/** Adds a new listener to this hook */
	public add(
		instance: ObserverEntity,
		priority: Priority<Src>,
		listener: Args,
	) {
		this.listeners.push([priority, instance, listener])
		this.listeners.sort((a, b) => a[0] - b[0])
	}

	/**
	 * Removes all the listeners tied to a specific instance
	 */
	public remove(instance: ObserverEntity) {
		this.listeners = this.listeners.filter(
			([_priority, hookListener]) => hookListener !== instance,
		)
	}

	/**
	 * Calls all the added listeners. Returns an array of the results
	 */
	public call(...params: Parameters<Args>) {
		return this.listeners.map(([_priority, _listener, call]) => call(...params))
	}

	/**
	 * Calls only the listeners belonging to instances that pass the predicate (dynamic)
	 */
	public callSome(
		params: Parameters<Args>,
		predicate: (instance: ObserverEntity) => boolean,
	) {
		return this.listeners.flatMap(([_, instance, listener]) =>
			predicate(instance) ? [listener(...params)] : [],
		)
	}
}
