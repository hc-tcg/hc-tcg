import {Entity, ObserverEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import type {Hook, PriorityHook, WaterfallHook} from '../types/hooks'
import {PrioritiesT, Priority, PriorityDict} from '../types/priorities'
import {AchievementComponent} from './achievement-component'
import type {CardComponent} from './card-component'
import {PlayerComponent} from './player-component'
import type {StatusEffectComponent} from './status-effect-component'

/** Abstraction over Hook interface that allows hooks to be automatically removed. This
 * is used to remove hooks when cards are removed from the board and when status effect
 * time out.
 */
export class ObserverComponent {
	public static table = 'observers'

	readonly game: GameModel
	readonly entity: ObserverEntity
	readonly wrappingEntity: Entity<
		| CardComponent
		| StatusEffectComponent
		| AchievementComponent
		| PlayerComponent
	>
	private hooks: Array<Hook<any, any> | PriorityHook<any, any>>

	knownHooks: any

	constructor(
		game: GameModel,
		entity: ObserverEntity,
		wrappingEntity: Entity<
			| CardComponent
			| StatusEffectComponent
			| AchievementComponent
			| PlayerComponent
		>,
	) {
		this.game = game
		this.entity = entity
		this.wrappingEntity = wrappingEntity
		this.hooks = []

		this.knownHooks = {}
	}

	public setupHook<Args extends (...any: any) => any>(
		hook: Hook<ObserverEntity, Args> | WaterfallHook<Args>,
		fun: NoInfer<Args>,
	) {
		this.knownHooks.push([[hook], fun])
	}
	public setupHookWithPriority<
		Args extends (...any: any) => any,
		Priorities extends PrioritiesT,
	>(
		hook: PriorityHook<Args, PriorityDict<Priorities>, Priorities>,
		priority: Priority<Priorities>,
		fun: NoInfer<Args>,
	) {
		this.knownHooks.push([[hook, priority], fun])
	}

	public subscribe<Args extends (...any: any) => any>(
		hook: Hook<ObserverEntity, Args> | WaterfallHook<Args>,
	) {
		for (const [hookData, fun] of this.knownHooks) {
			if (hookData[0] === hook) {
				hook.add(this.entity, fun)
				this.hooks.push(hook)
				break
			}
		}
	}

	/** Subscribe to a priority hook with this observer. Functions similarly to `subscribe`. */
	public subscribeWithPriority<
		Args extends (...any: any) => any,
		Priorities extends PrioritiesT,
	>(
		hook: PriorityHook<Args, PriorityDict<Priorities>, Priorities>,
		priority: Priority<Priorities>,
	) {
		for (const [hookData, fun] of this.knownHooks) {
			if (hookData[0] === hook && hookData[1] === priority) {
				hook.add(this.entity, priority, fun)
				this.hooks.push(hook)
				break
			}
		}
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
