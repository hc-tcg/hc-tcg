import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterAttack, onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

const DoubleItemPlayedEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'double-item-played',
	icon: 'double-item-played',
	name: 'double-item-played',
	description:
		'double-item-played',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	): void {
		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default DoubleItemPlayedEffect
