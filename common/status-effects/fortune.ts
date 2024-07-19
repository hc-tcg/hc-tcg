import {StatusEffectComponent, PlayerComponent, ObserverComponent} from '../components'
import {GameModel} from '../models/game-model'
import {PlayerStatusEffect, StatusEffectProps, hiddenStatusEffect} from './status-effect'

export default class FortuneEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...hiddenStatusEffect,
		name: 'Fortune',
		description: 'Any coin flips this turn will roll heads.',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		observer.subscribe(player.hooks.onCoinFlip, (card, coinFlips) => {
			for (let i = 0; i < coinFlips.length; i++) {
				coinFlips[i] = 'heads'
			}
			return coinFlips
		})
	}
}
