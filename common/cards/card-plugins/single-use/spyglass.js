import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'
import {discardCard, flipCoin} from '../../../../server/utils'

/**
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
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)
		const coinResult = this.getInstanceKey(instance, 'coinResult')

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const coinFlip = flipCoin(player, this.id)
			player.custom[coinResult] = coinFlip[0]

			// Client uses the id instead of the instance for the modal
			player.custom[this.id] = {
				canDiscard: coinFlip[0] === 'heads',
				cards: opponentPlayer.hand,
			}
			player.followUp[instanceKey] = this.id

			player.hooks.onFollowUp[instance] = (followUp, pickedSlots, modalResult) => {
				if (followUp !== instanceKey) return
				delete player.custom[this.id]
				delete player.hooks.onFollowUp[instance]
				delete player.hooks.onFollowUpTimeout[instance]
				delete player.followUp[instanceKey]

				if (!modalResult || !modalResult.card) return
				if (player.custom[coinResult] !== 'heads') return

				discardCard(game, modalResult.card)
			}

			player.hooks.onFollowUpTimeout[instance] = (followUp) => {
				if (followUp !== instanceKey) return
				delete player.custom[this.id]
				delete player.hooks.onFollowUp[instance]
				delete player.hooks.onFollowUpTimeout[instance]
				delete player.followUp[instanceKey]
				if (player.custom[coinResult] !== 'heads') return

				// Discard a random card from the opponent's hand
				const {opponentPlayer} = pos
				const slotIndex = Math.floor(Math.random() * opponentPlayer.hand.length)
				discardCard(game, opponentPlayer.hand[slotIndex])
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {opponentPlayer} = pos

		// Gem can use 2 spyglasses on the same turn
		if (opponentPlayer.hand.length === 0) return 'NO'

		// They can discard the only hermit in their hand
		if (game.state.turn === 1) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
		delete player.custom[this.getInstanceKey(instance, 'coinResult')]
		delete player.custom[this.id]
	}
}

export default SpyglassSingleUseCard
