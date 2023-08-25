import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import {discardFromHand} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class SpyglassSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'spyglass',
			numeric_id: 91,
			name: 'Spyglass',
			rarity: 'common',
			description:
				"Look at opponent's hand.\n\nFlip a coin.\n\nIf heads, choose 1 of those cards to discard.",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const coinResult = this.getInstanceKey(instance, 'coinResult')

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const coinFlip = flipCoin(player, this.id)
			player.custom[coinResult] = coinFlip[0]

			// Client uses the id instead of the instance for the modal
			player.custom[this.id] = {
				canDiscard: coinFlip[0] === 'heads',
				cards: opponentPlayer.hand,
			}

			player.modalRequest = {
				id: this.id,
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'

					if (player.custom[coinResult] === 'heads') {
						discardFromHand(opponentPlayer, modalResult.card || null)
					}

					return 'SUCCESS'
				},
				onTimeout() {
					if (player.custom[coinResult] === 'heads') {
						// Discard a random card from the opponent's hand
						const slotIndex = Math.floor(Math.random() * opponentPlayer.hand.length)
						discardFromHand(opponentPlayer, opponentPlayer.hand[slotIndex])
					}
				},
			}
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach
		const {opponentPlayer} = pos

		// Gem can use 2 spyglasses on the same turn
		if (opponentPlayer.hand.length === 0) return 'NO'

		// They can discard the only hermit in their hand
		if (game.state.turn.turnNumber === 1) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
		delete player.custom[this.getInstanceKey(instance, 'coinResult')]
		delete player.custom[this.id]
	}
}

export default SpyglassSingleUseCard
