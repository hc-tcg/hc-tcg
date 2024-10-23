import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

const FortuneEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	name: 'Fortune',
	id: 'fortune',
	icon: 'fortune',
	description: (_component) => 'Any coin flips this turn will roll heads.',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.onCoinFlip, (_card, coinFlips) => {
			for (let i = 0; i < coinFlips.length; i++) {
				coinFlips[i].result = 'heads'
				coinFlips[i].forced = true
			}
			return coinFlips
		})

		observer.subscribeWithPriority(
			player.opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default FortuneEffect
