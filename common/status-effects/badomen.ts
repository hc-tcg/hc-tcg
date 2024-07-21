import {CardStatusEffect, Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'

class BadOmenEffect extends CardStatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		icon: 'badomen',
		name: 'Bad Omen',
		description: 'All coinflips are tails.',
		counter: 3,
		counterType: 'turns',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		const {player, opponentPlayer} = target

		if (!effect.counter) effect.counter = this.props.counter

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})

		observer.subscribeBefore(player.hooks.onCoinFlip, (card, coinFlips) => {
			// Only modify when the target hermit is "flipping"
			if (
				target.entity !== card.entity &&
				(game.currentPlayer.id !== player.id ||
					player.activeRow?.getHermit()?.entity !== target.entity)
			)
				return coinFlips

			for (let i = 0; i < coinFlips.length; i++) {
				if (coinFlips[i]) coinFlips[i] = 'tails'
			}
			return coinFlips
		})
	}
}

export default BadOmenEffect
