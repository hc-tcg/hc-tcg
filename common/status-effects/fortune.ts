import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onCoinFlip, onTurnEnd} from '../types/priorities'
import SpentFortuneEffect from './spent-fortune'
import {StatusEffect, systemStatusEffect} from './status-effect'

const FortuneEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	name: 'Fortune',
	id: 'fortune',
	icon: 'fortune',
	description: 'Any coin flips this turn will roll heads.',
	applyCondition: (_game, value) => {
		return (
			value instanceof PlayerComponent &&
			!value.hasStatusEffect(FortuneEffect) &&
			!value.hasStatusEffect(SpentFortuneEffect)
		)
	},
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			player.hooks.onCoinFlip,
			onCoinFlip.FORTUNE,
			(_card, coinFlips) => {
				for (let i = 0; i < coinFlips.length; i++) {
					coinFlips[i].result = 'heads'
					coinFlips[i].forced = true
				}
				return coinFlips
			},
		)

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
