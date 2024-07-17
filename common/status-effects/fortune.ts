import {StatusEffectComponent, PlayerComponent, ObserverComponent} from '../components'
import {GameModel} from '../models/game-model'
import {PlayerStatusEffect, StatusEffectProps, statusEffect} from './status-effect'

export default class Fortune extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		name: 'Fortune',
		id: 'fortune',
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
