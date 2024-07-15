import {GameModel} from '../models/game-model'
import StatusEffect, {Counter, StatusEffectProps} from '../status-effects/status-effect'
import {CardEntity, StatusEffectEntity} from '../types/game-state'
import {type LocalStatusEffectInstance, WithoutFunctions} from '../types/server-requests'
import {CardComponent} from './card-component'

let STATUS_EFFECTS: Record<any, StatusEffect>
import('../status-effects').then((mod) => (STATUS_EFFECTS = mod.STATUS_EFFECTS))

export class StatusEffectComponent<Props extends StatusEffectProps = StatusEffectProps> {
	readonly game: GameModel
	readonly entity: StatusEffectEntity
	readonly statusEffect: StatusEffect<Props>
	public targetEntity: CardEntity | null
	public counter: number | null

	constructor(game: GameModel, entity: StatusEffectEntity, statusEffect: new () => StatusEffect) {
		this.game = game
		this.entity = entity
		this.statusEffect = STATUS_EFFECTS[statusEffect.name] as StatusEffect<Props>
		this.targetEntity = null
		this.counter = null
	}

	public toLocalStatusEffectInstance(): LocalStatusEffectInstance | null {
		if (!this.target) {
			return null
		}
		return {
			props: WithoutFunctions(this.props),
			instance: this.entity,
			targetInstance: this.target.toLocalCardInstance(),
			counter: this.counter,
		}
	}

	public get props(): Props {
		return this.statusEffect.props
	}

	public get target(): CardComponent | null {
		return this.game.components.get(this.targetEntity)
	}

	public apply(cardEntity: CardEntity | null | undefined) {
		if (!cardEntity) return
		let cardComponent = this.game.components.get(cardEntity)
		if (!cardComponent) {
			return
		}
		this.targetEntity = cardEntity
		this.statusEffect.onApply(this.game, this, cardComponent)
	}

	public remove() {
		if (!this.target) return
		this.statusEffect.onRemoval(this.game, this, this.target)
		this.targetEntity = null
	}

	public isCounter(): this is StatusEffectComponent<Counter> {
		return isCounter(this.statusEffect.props)
	}
}
