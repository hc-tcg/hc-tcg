import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	PlayerStatusEffect,
	StatusEffect,
	systemStatusEffect,
} from './status-effect'

export default class FortuneEffect extends PlayerStatusEffect {
	props: StatusEffect = {
		...systemStatusEffect,
		name: 'Fortune',
		icon: 'fortune',
		description: 'Any coin flips this turn will roll heads.',
	}

	override onApply(
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
	}
}
