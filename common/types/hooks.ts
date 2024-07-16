import {CardComponent, StatusEffectComponent} from '../components'
import {GameModel} from '../models/game-model'
import {Entity} from './game-state'

export class Hook<Listener extends any, Args extends (...args: any) => any> {
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

export type ObserverEntity = Entity<ObserverComponent>

/** Abstraction over Hook interface that allows hooks to be automatically removed. This
 * is used to remove hooks when cards are removed from the board and when status effect
 * time out.
 */
export class ObserverComponent {
	readonly game: GameModel
	readonly entity: ObserverEntity
	readonly wrappingEntity: Entity<CardComponent | StatusEffectComponent>
	private hooks: Array<Hook<any, any>>

	constructor(
		game: GameModel,
		entity: ObserverEntity,
		wrappingEntity: Entity<CardComponent | StatusEffectComponent>
	) {
		this.game = game
		this.entity = entity
		this.wrappingEntity = wrappingEntity
		this.hooks = []
	}

	/** Subscribe to a hook with this observer */
	public subscribe<Args extends (...any: any) => any>(hook: Hook<ObserverEntity, Args>, fun: Args) {
		hook.add(this.entity, fun)
		this.hooks.push(hook)
	}

	/** Subscribe a specific hook, and put this observer at the top of the queue. */
	public subscribeBefore<Args extends (...any: any) => any>(
		hook: Hook<ObserverComponent, Args>,
		fun: Args
	) {
		hook.addBefore(this, fun)
		this.hooks.push(hook)
	}

	/** Stop listening to a specific hook */
	public unsubscribe(hook: Hook<ObserverEntity, any>) {
		hook.remove(this.entity)
	}

	/** Disconnect all hooks connected to this observer */
	public unsubscribeFromEverything() {
		for (const hook of this.hooks) {
			hook.remove(this.entity)
		}
	}
}

/**
 * Custom hook class for the game, derived from the generic custom hook class.
 *
 * Allows adding and removing listeners with the card instance as a reference, and calling all or some of the listeners.
 */
export class GameHook<Args extends (...args: any) => any> extends Hook<ObserverEntity, Args> {
	/**
	 * Calls only the listeners belonging to instances that pass the predicate
	 */
	public callSome(params: Parameters<Args>, predicate: (instance: ObserverEntity) => boolean) {
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
