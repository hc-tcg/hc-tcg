import SingleUseCard from './_single-use-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class LootingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'looting',
			name: 'Looting',
			rarity: 'rare',
			description:
				"Flip a coin.\n\nIf heads, user picks 1 item card from opposing active Hermit and adds it to user's hand.\n\nDiscard after use.",
		})
		this.pickOn = 'followup'
		this.useReqs = [{target: 'opponent', type: 'item', amount: 1, active: true}]
		this.pickReqs = this.useReqs
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, currentPlayer, opponentActiveRow} = game.ds

			if (singleUseInfo?.id === this.id) {
				// If opponent has no active hermit, can't activate
				if (!opponentActiveRow) return 'INVALID'

				// If opponent has no items on active ehrmit, can't activate
				const anyItemCards = opponentActiveRow.itemCards.some(Boolean)
				if (!anyItemCards) return 'INVALID'

				const coinFlip = flipCoin(currentPlayer)
				currentPlayer.coinFlips[this.id] = coinFlip
				return coinFlip[0] === 'heads' ? this.id : 'DONE'
			}
		})

		game.hooks.followUp.tap(this.id, (action, followUpState) => {
			const {currentPlayer} = game.ds
			const {followUp, pickedCardsInfo} = followUpState

			if (followUp === this.id) {
				delete currentPlayer.coinFlips[this.id]
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards.length !== 1) return 'INVALID'
				const pickedCard = suPickedCards[0]
				if (pickedCard.cardInfo.type !== 'item') return 'INVALID'
				pickedCard.row.itemCards[pickedCard.slotIndex] = null
				currentPlayer.hand.push(pickedCard.card)
				return 'DONE'
			}
		})
	}
}

export default LootingSingleUseCard
