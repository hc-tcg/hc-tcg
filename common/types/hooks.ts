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
 * Allows listeners to be called in a more deterministic order, neccessary when listeners are dependent on the execution of
 * other listeners.
 * Listeners can be added or removed at any time without causing issues. Listeners added at the current priority or a later
 * priority will always be called.
 */
export class PriorityHook<
	Args extends (...args: any) => any,
	Priorities extends PriorityDict<Src>,
	Src extends PrioritiesT = PrioritySrc<Priorities>,
> {
	private _listeners: Record<
		number,
		Array<[instance: ObserverEntity, listener: Args, removed: boolean]>
	> = []

	public constructor(priorities: PriorityDict<Src>) {
		for (const [_, priority] of Object.entries(priorities)) {
			this._listeners[priority] = []
		}
	}

	get listeners(): Array<[ObserverEntity, Args]> {
		return Object.entries(this._listeners).flatMap((listeners) =>
			listeners.filter(([_instance, _listerner, removed]) => !removed),
		) as any
	}

	/** Adds a new listener to this hook */
	public add(
		instance: ObserverEntity,
		priority: Priority<Src>,
		listener: Args,
	) {
		this._listeners[priority].push([instance, listener, false])
	}

	/**
	 * Removes all the _listeners tied to a specific instance
	 */
	public remove(instance: ObserverEntity) {
		for (const [key, _] of Object.entries(this._listeners)) {
			let numKey = Number(key)
			this._listeners[numKey]
				.filter(([hookListener]) => hookListener === instance)
				.map((x) => (x[2] = true))
		}
	}

	/**
	 * Calls all the added listeners. Returns an array of the results
	 */
	public call(...params: Parameters<Args>) {
		for (const [key, _] of Object.entries(this._listeners)) {
			const numKey = Number(key)
			for (let i = 0; i < this._listeners[numKey].length; i++) {
				if (this._listeners[numKey][i][2]) continue
				this._listeners[numKey][i][1](...params)
			}
		}
	}

	/**
	 * Calls only the listeners belonging to instances that pass the predicate (dynamic)
	 */
	public callSome(
		params: Parameters<Args>,
		predicate: (instance: ObserverEntity) => boolean,
	) {
		for (const [key, _] of Object.entries(this._listeners)) {
			const numKey = Number(key)
			for (let i = 0; i < this._listeners[numKey].length; i++) {
				if (this._listeners[numKey][i][2]) continue
				if (!predicate(this._listeners[numKey][i][0])) continue
				this._listeners[numKey][i][1](...params)
			}
		}
	}
}
