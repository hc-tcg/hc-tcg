import type {
	CardEntity,
	Entity,
	ObserverEntity,
	StatusEffectEntity,
} from '../entities'
import {GameModel} from '../models/game-model'
import {StatusEffect, StatusEffect} from '../status-effects/status-effect'
import {CardComponent} from './card-component'
import {ObserverComponent} from './observer-component'
import {PlayerComponent} from './player-component'

let STATUS_EFFECTS: Record<any, StatusEffect<any>>
import('../status-effects').then((mod) => (STATUS_EFFECTS = mod.STATUS_EFFECTS))

export class StatusEffectComponent<
	TargetT extends CardComponent | PlayerComponent =
		| CardComponent
		| PlayerComponent,
	Props extends StatusEffect = StatusEffect,
> {
	readonly game: GameModel
	readonly entity: StatusEffectEntity
	readonly statusEffect: StatusEffect<Props>
	readonly order: number
	readonly creatorEntity: CardEntity
	public targetEntity: Entity<CardComponent | PlayerComponent> | null
	public counter: number | null
	public observerEntity: ObserverEntity | null

	constructor(
		game: GameModel,
		entity: StatusEffectEntity,
		statusEffect: new () => StatusEffect<TargetT>,
		creator: CardEntity,
	) {
		this.game = game
		this.entity = entity
		this.statusEffect = STATUS_EFFECTS[statusEffect.name] as StatusEffect<
			any,
			Props
		>
		this.creatorEntity = creator
		this.order = game.components.filter(StatusEffectComponent).length
		this.targetEntity = null
		this.counter = null
		this.observerEntity = null
	}

	public get props(): Props {
		return this.statusEffect.props as any
	}

	public get creator(): CardComponent {
		return this.game.components.getOrError(this.creatorEntity)
	}

	public get target(): TargetT {
		return this.game.components.get(this.targetEntity) as any
	}

	/** Apply a status effect to a specific player or card */
	public apply(targetEntity: Entity<TargetT> | null | undefined) {
		if (!targetEntity) return

		let target = this.game.components.get(targetEntity)
		if (!target) return

		if (!this.props.applyCondition(this.game, target)) return

		let observer = this.game.components.new(ObserverComponent, this.entity)

		this.observerEntity = observer.entity
		this.targetEntity = target.entity
		this.statusEffect.onApply(this.game, this as any, target as any, observer)

		if (this.statusEffect.props.applyLog) {
			this.game.battleLog.addStatusEffectEntry(
				this.entity,
				this.statusEffect.props.applyLog,
			)
		}
	}

	public remove() {
		let observer = this.game.components.get(this.observerEntity)
		if (!this.target || !observer) return
		observer.unsubscribeFromEverything()
		this.statusEffect.onRemoval(
			this.game,
			this as any,
			this.target as any,
			observer,
		)
		if (this.statusEffect.props.removeLog) {
			this.game.battleLog.addStatusEffectEntry(
				this.entity,
				this.statusEffect.props.removeLog,
			)
		}
		this.targetEntity = null
		this.observerEntity = null
	}
}
