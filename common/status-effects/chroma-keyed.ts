import {StatusEffectComponent, ObserverComponent, CardComponent} from '../components'
import {AttackModel} from '../models/attack-model'
import {GameModel} from '../models/game-model'
import {CardStatusEffect, Counter, StatusEffectProps, systemStatusEffect} from './status-effect'

class ChromaKeyedEffect extends CardStatusEffect {
	props: StatusEffectProps & Counter = {
		...systemStatusEffect,
		icon: 'chroma-keyed',
		name: 'Chroma Keyed',
		description: 'You deal 10hp less damage for each level of this status effect.',
		counter: 1,
		counterType: 'number',
	}

	public override onApply(
		_game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent
	): void {
		if (!effect.counter) effect.counter = this.props.counter

		let chromaUsedThisTurn = true

		observer.subscribe(target.player.hooks.onAttack, (attack: AttackModel) => {
			if (!attack.isAttacker(target.entity) || attack.type !== 'secondary') {
				effect.remove()
				return
			}
			if (effect.counter === null) return

			attack.reduceDamage(effect.entity, effect.counter * 10)
			effect.counter++
			chromaUsedThisTurn = true
		})

		observer.subscribe(target.player.hooks.onTurnEnd, () => {
			if (!chromaUsedThisTurn) effect.remove()
			chromaUsedThisTurn = false
		})
	}
}

export default ChromaKeyedEffect
