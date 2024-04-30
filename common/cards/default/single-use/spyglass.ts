import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {discardFromHand} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class SpyglassSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'spyglass',
			numericId: 91,
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

		player.hooks.onApply.add(instance, () => {
			const coinFlip = flipCoin(player, {cardId: this.id, cardInstance: instance})
			const canDiscard = coinFlip[0] === 'heads' && opponentPlayer.hand.length > 0

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: `Spyglass${canDiscard ? `: Select 1 card to discard` : ''}`,
						modalDescription: '',
						cards: opponentPlayer.hand,
						selectionSize: canDiscard ? 1 : 0,
						primaryButton: {
							text: canDiscard ? 'Confirm Selection' : 'Close',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'
					if (!canDiscard) return 'SUCCESS'

					if (!modalResult.cards || modalResult.cards.length !== 1) return 'FAILURE_INVALID_DATA'
					discardFromHand(opponentPlayer, modalResult.cards[0])

					game.addModalRequest({
						playerId: opponentPlayer.id,
						data: {
							modalId: 'selectCards',
							payload: {
								modalName: 'Spyglass: Card your opponent discarded.',
								modalDescription: '',
								cards: modalResult.cards,
								selectionSize: 0,
								primaryButton: {
									text: 'Close',
									variant: 'default',
								},
							},
						},
						onResult() {
							return 'SUCCESS'
						},
						onTimeout() {
							// Do nothing
						},
					})

					return 'SUCCESS'
				},
				onTimeout() {
					if (canDiscard) {
						// Discard a random card from the opponent's hand
						const slotIndex = Math.floor(Math.random() * opponentPlayer.hand.length)
						discardFromHand(opponentPlayer, opponentPlayer.hand[slotIndex])
					}
				},
			})
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)
		const {opponentPlayer} = pos

		if (opponentPlayer.hand.length === 0) result.push('UNMET_CONDITION')
		if (game.state.turn.turnNumber === 1) result.push('UNMET_CONDITION')

		return result
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default SpyglassSingleUseCard
