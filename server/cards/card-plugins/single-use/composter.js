import SingleUseCard from './_single-use-card'
import {equalCard, discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// TODO - don't allow selecting the same card twice
// TODO - If there is is less cards in hand (1,0) limit the requirment or don't allow to use it
// TODO - don't allow to compost hermit cards if there is no hermit on board (perhaps don't allow SU cards at all if no hermits are on board)
class ComposterSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'composter',
			name: 'Composter',
			rarity: 'common',
			description:
				'Discard 2 cards in your hand. Draw 2 cards.\n\nDiscard after use.',
		})
		this.pickOn = 'apply'
		this.useReqs = [{target: 'hand', type: 'any', amount: 2}]
		this.pickReqs = this.useReqs
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, actionState) => {
			const {singleUseInfo, currentPlayer} = game.ds
			const {pickedCardsInfo} = actionState

			if (singleUseInfo?.id === this.id) {
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards.length !== 2) return 'INVALID'

				// discard two cards
				suPickedCards.forEach((info) => discardCard(game, info.card))

				// draw two cards
				for (let i = 0; i < 2; i++) {
					const drawCard = currentPlayer.pile.shift()
					if (drawCard) currentPlayer.hand.push(drawCard)
				}
				return 'DONE'
			}
		})
	}
}

export default ComposterSingleUseCard
