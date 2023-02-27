import SingleUseCard from './_single-use-card'
import {equalCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// TODO wrap card-list if there is too many cards in discard (+ scroll)
class ChestSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chest',
			name: 'Chest',
			rarity: 'rare',
			description:
				'Look through discard pile and select 1 card to return to hand.\n\nDiscard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, (turnAction) => {
			const {singleUseInfo, currentPlayer, opponentPlayer} = game.ds

			if (singleUseInfo?.id === this.id) {
				const selectedCard = turnAction.payload
				if (!selectedCard) return 'INVALID'
				const discardedCard = currentPlayer.discarded.find((card) =>
					equalCard(card, selectedCard)
				)
				if (!discardedCard) return 'INVALID'
				currentPlayer.discarded = currentPlayer.discarded.filter(
					(card) => !equalCard(card, selectedCard)
				)
				currentPlayer.hand.push(discardedCard)
				return 'DONE'
			}
		})
	}
}

export default ChestSingleUseCard
