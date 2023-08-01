import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import {discardCard} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

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

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)
		const coinResult = this.getInstanceKey(instance, 'coinResult')

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const coinFlip = flipCoin(player, this.id)
			player.custom[coinResult] = coinFlip[0]

			// Client uses the id instead of the instance for the modal
			player.custom[this.id] = {
				canDiscard: coinFlip[0] === 'heads',
				cards: opponentPlayer.hand,
			}
			player.followUp[instanceKey] = this.id

			player.hooks.onFollowUp.add(instance, (followUp, pickedSlots, modalResult) => {
				if (followUp !== instanceKey) return
				delete player.custom[this.id]
				player.hooks.onFollowUp.remove(instance)
				player.hooks.onFollowUpTimeout.remove(instance)
				delete player.followUp[instanceKey]

				if (!modalResult || !modalResult.card) return
				if (player.custom[coinResult] !== 'heads') return

				discardCard(game, modalResult.card)
			})

			player.hooks.onFollowUpTimeout.add(instance, (followUp) => {
				if (followUp !== instanceKey) return
				delete player.custom[this.id]
				player.hooks.onFollowUp.remove(instance)
				player.hooks.onFollowUpTimeout.remove(instance)
				delete player.followUp[instanceKey]
				if (player.custom[coinResult] !== 'heads') return

				// Discard a random card from the opponent's hand
				const {opponentPlayer} = pos
				const slotIndex = Math.floor(Math.random() * opponentPlayer.hand.length)
				discardCard(game, opponentPlayer.hand[slotIndex])
			})
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {opponentPlayer} = pos

		// Gem can use 2 spyglasses on the same turn
		if (opponentPlayer.hand.length === 0) return 'NO'

		// They can discard the only hermit in their hand
		if (game.state.turn === 1) return 'NO'

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
