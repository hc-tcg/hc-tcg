import {Entity, ObserverEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import type {Hook, PriorityHook, WaterfallHook} from '../types/hooks'
import {PrioritiesT, Priority, PriorityDict} from '../types/priorities'
import type {CardComponent} from './card-component'
import {PlayerComponent} from './player-component'
import type {StatusEffectComponent} from './status-effect-component'

/** Abstraction over Hook interface that allows hooks to be automatically removed. This
 * is used to remove hooks when cards are removed from the board and when status effect
 * time out.
 */
export class ObserverComponent {
	readonly game: GameModel
	readonly entity: ObserverEntity
	readonly wrappingEntity: Entity<
		CardComponent | StatusEffectComponent | PlayerComponent
	>
	private hooks: Array<Hook<any, any> | PriorityHook<any, any>>

	constructor(
		game: GameModel,
		entity: ObserverEntity,
		wrappingEntity: Entity<
			CardComponent | StatusEffectComponent | PlayerComponent
		>,
	) {
		this.game = game
		this.entity = entity
		this.wrappingEntity = wrappingEntity
		this.hooks = []
	}

	/** Subscribe to a hook with this observer. This hook will be removed when the observer is detroyed.
	 * Cards and status effects will destoy their own observers, so you as the user do not need to
	 * worry about this!
	 * If you are looking for a hook that will be called after the observer is destoryed (the card is removed
	 * from the board), please use a status effect or `oneShot` instead.
	 */
	public subscribe<Args extends (...any: any) => any>(
		hook: Hook<ObserverEntity, Args> | WaterfallHook<Args>,
		fun: Args,
	) {
		hook.add(this.entity, fun)
		this.hooks.push(hook)
	}

	/** Subscribe a specific hook, and put this observer at the top of the queue. This hook will be
	 * removed when the observer is destroyed.
	 */
	public subscribeBefore<Args extends (...any: any) => any>(
		hook: Hook<ObserverEntity, Args> | WaterfallHook<Args>,
		fun: Args,
	) {
		hook.addBefore(this.entity, fun)
		this.hooks.push(hook)
	}

	/** Subscribe to a priority hook with this observer. Functions similarly to `subscribe`. */
	public subscribeWithPriority<
		Args extends (...any: any) => any,
		Priorities extends PrioritiesT,
	>(
		hook: PriorityHook<Args, PriorityDict<Priorities>, Priorities>,
		priority: Priority<Priorities>,
		fun: Args,
	) {
		hook.add(this.entity, priority, fun)
		this.hooks.push(hook)
	}

	/** Stop listening to a specific hook */
	public unsubscribe(hook: Hook<ObserverEntity, any> | PriorityHook<any, any>) {
		hook.remove(this.entity)
	}

	/** Unsubscribe from all hooks connected to this observer. */
	public unsubscribeFromEverything() {
		for (const hook of this.hooks) {
			hook.remove(this.entity)
		}
	}
}
