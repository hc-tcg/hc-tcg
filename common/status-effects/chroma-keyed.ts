import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterAttack, onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

const ChromaKeyedEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	id: 'chroma-keyed',
	icon: 'chroma-keyed',
	name: 'Chroma Keyed',
	description:
		'You deal 10hp less damage with "Jopacity" for each level of this status effect.',
	counter: 1,
	counterType: 'number',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent,
	): void {
		if (!effect.counter) effect.counter = this.counter

		let jopacityUsedThisTurn = false
		let previousUses = effect.counter - 1
		
		observer.subscribeWithPriority(
			target.player.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (previousUses !== this.counter) jopacityUsedThisTurn = true
				else if (attack.isAttacker(target.entity)) effect.remove()
			},
		)

		observer.subscribeWithPriority(
			target.player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!jopacityUsedThisTurn) effect.remove()
				jopacityUsedThisTurn = false
				if (effect.counter !== null) previousUses = effect.counter - 1
			},
		)
	},
}

export default ChromaKeyedEffect
