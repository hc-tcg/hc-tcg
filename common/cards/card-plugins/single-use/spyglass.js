import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {discardCard, flipCoin} from '../../../../server/utils'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class SpyglassSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'spyglass',
			name: 'Spyglass',
			rarity: 'common',
			description:
				"Look at opponent's hand.\n\nFlip a coin.\n\nIf heads, choose 1 of those cards to discard.",
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 * @param {Object} modalResult
	 */
	onApply(game, instance, pos, pickedSlots, modalResult) {
		const {player, otherPlayer} = pos

		const coinFlip = flipCoin(player, this.id)
		player.coinFlips[this.id] = coinFlip

		// Client uses the id instead of the instance for the modal
		player.custom[this.id] = {
			canDiscard: coinFlip[0] === 'heads',
			cards: otherPlayer.hand,
		}
		player.followUp = this.id
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onFollowUp[instance] = (
			followUp,
			pickedSlots,
			modalResult
		) => {
			if (followUp !== this.id) return
			player.followUp = null

			console.log('modalResult', modalResult)
			if (!modalResult || !modalResult.card) return
			if (player.coinFlips[this.id][0] !== 'heads') return // You never know

			discardCard(game, modalResult.card)
		}

		player.hooks.onFollowUpTimeout[instance] = (followUp) => {
			if (followUp !== this.id) return
			player.followUp = null

			if (player.coinFlips[this.id][0] !== 'heads') return

			// Discard a random card from the opponent's hand
			const {otherPlayer} = pos
			const slotIndex = Math.floor(Math.random() * otherPlayer.hand.length)
			discardCard(game, otherPlayer.hand[slotIndex])
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {otherPlayer} = pos

		// Gem can use 2 spyglasses on the same turn
		if (otherPlayer.hand.length === 0) return 'NO'

		// They can discard the only hermit in their hand
		if (game.state.turn === 1) return 'NO'

		return 'YES'
	}

	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.custom[this.id]
		delete player.hooks.onFollowUp[instance]
		delete player.hooks.onFollowUpTimeout[instance]
	}
}

export default SpyglassSingleUseCard
