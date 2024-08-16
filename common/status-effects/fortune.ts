import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {StatusEffect, systemStatusEffect} from './status-effect'

const FortuneEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	name: 'Fortune',
	id: 'fortune',
	icon: 'fortune',
	description: 'Any coin flips this turn will roll heads.',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(player.hooks.onCoinFlip, (_card, coinFlips) => {
			for (let i = 0; i < coinFlips.length; i++) {
				coinFlips[i] = 'heads'
			}
			return coinFlips
		})

		observer.subscribe(player.opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	},
}

export default FortuneEffect
