import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {onCoinFlip} from '../types/priorities'
import {Counter, statusEffect} from './status-effect'

const BadOmenEffect: Counter<CardComponent> = {
	...statusEffect,
	id: 'bad-omen',
	icon: 'bad-omen',
	name: 'Bad Omen',
	description: 'All coin flips are tails.',
	counter: 3,
	counterType: 'turns',

	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = target

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})

		observer.subscribeWithPriority(
			player.hooks.onCoinFlip,
			onCoinFlip.BAD_OMEN,
			(card, coinFlips) => {
				// Only modify when the target hermit is "flipping"
				if (
					target.entity !== card.entity &&
					(game.currentPlayer.entity !== player.entity ||
						player.activeRow?.getHermit()?.entity !== target.entity)
				)
					return

				for (let i = 0; i < coinFlips.length; i++) {
					coinFlips[i].result = 'tails'
					coinFlips[i].forced = true
				}
			},
		)
	},
}

export default BadOmenEffect
