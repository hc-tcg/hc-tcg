import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
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

		let previousUses = effect.counter - 1

		observer.subscribeWithPriority(
			target.player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (previousUses === effect.counter) effect.remove()
				if (effect.counter !== null) previousUses = effect.counter
			},
		)
	},
}

export default ChromaKeyedEffect
