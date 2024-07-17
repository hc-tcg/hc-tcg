import {GameModel} from '../models/game-model'
import {StatusEffect, StatusEffectProps} from '../status-effects/status-effect'
import type {
	CardEntity,
	Entity,
	ObserverEntity,
	PlayerEntity,
	StatusEffectEntity,
} from '../entities'
import {type LocalStatusEffectInstance, WithoutFunctions} from '../types/server-requests'
import {CardComponent} from './card-component'
import {ObserverComponent} from './observer-component'
import {PlayerComponent} from './player-component'

let STATUS_EFFECTS: Record<any, StatusEffect<any>>
import('../status-effects').then((mod) => (STATUS_EFFECTS = mod.STATUS_EFFECTS))

export class StatusEffectComponent<
	TargetT extends CardComponent | PlayerComponent = CardComponent | PlayerComponent,
	Props extends StatusEffectProps = StatusEffectProps,
> {
	readonly game: GameModel
	readonly entity: StatusEffectEntity
	readonly statusEffect: StatusEffect<Props>
	public targetEntity: Entity<CardComponent | PlayerComponent> | null
	public counter: number | null
	private observerEntity: ObserverEntity | null

	constructor(
		game: GameModel,
		entity: StatusEffectEntity,
		statusEffect: new () => StatusEffect<TargetT>
	) {
		this.game = game
		this.entity = entity
		this.statusEffect = STATUS_EFFECTS[statusEffect.name] as StatusEffect<any, Props>
		this.targetEntity = null
		this.counter = null
		this.observerEntity = null
	}

	public toLocalStatusEffectInstance(): LocalStatusEffectInstance | null {
		if (!this.target) {
			return null
		}
		return {
			props: WithoutFunctions(this.props),
			instance: this.entity,
			targetInstance:
				this.target instanceof CardComponent
					? this.target.toLocalCardInstance()
					: this.target.entity,
			counter: this.counter,
		}
	}

	public get props(): Props {
		return this.statusEffect.props as any
	}

	public get target(): TargetT {
		return this.game.components.get(this.targetEntity) as any
	}

	/** Apply a status effect to a specific card, or the active hermit if not specified */
	public apply(targetEntity?: Entity<TargetT> | null) {
		if (!targetEntity) return

		let target = this.game.components.get(targetEntity)
		if (!target) return
		let observer = this.game.components.new(ObserverComponent, this.entity)

		this.observerEntity = observer.entity
		this.targetEntity = target.entity
		this.statusEffect.onApply(this.game, this as any, target as any, observer)
	}

	public remove() {
		let observer = this.game.components.get(this.observerEntity)
		if (!this.target || !observer) return
		observer.unsubscribeFromEverything()
		this.statusEffect.onRemoval(this.game, this as any, this.target as any, observer)
		this.targetEntity = null
		this.observerEntity = null
	}
}
