import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

const UsedClockEffect: Counter<PlayerComponent> = {
	...systemStatusEffect,
	id: 'used-clock',
	icon: 'used-clock',
	name: 'Clocked Out',
	description: "Your opponent's turns cannot be skipped consecutively.",
	counter: 1,
	counterType: 'turns',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		if (effect.counter === null) effect.counter = this.counter

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (effect.counter === null) return
				if (effect.counter === 0) effect.remove()
				effect.counter--
			},
		)
	},
}

export default UsedClockEffect
