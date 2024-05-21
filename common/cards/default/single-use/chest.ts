import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {discardSingleUse, retrieveCard} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class ChestSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chest',
			numericId: 4,
			name: 'Chest',
			rarity: 'rare',
			description: 'Choose one card from your discard pile to return to your hand.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)
		const {player} = pos

		if (player.discarded.filter((card) => card.cardId !== 'clock').length <= 0)
			result.push('UNMET_CONDITION')

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addModalRequest({
			playerId: player.id,
			data: {
				modalId: 'selectCards',
				payload: {
					modalName: 'Chest: Choose a card to retrieve from your discard pile.',
					modalDescription: '',
					cards: player.discarded,
					selectionSize: 1,
					primaryButton: {
						text: 'Confirm Selection',
						variant: 'default',
					},
				},
			},
			onResult(modalResult) {
				if (!modalResult) return 'FAILURE_INVALID_DATA'
				if (!modalResult.result) {
					// Allow player to cancel using Chest
					discardSingleUse(game, player)
					return 'SUCCESS'
				}
				if (!modalResult.cards) return 'FAILURE_INVALID_DATA'
				if (modalResult.cards.length !== 1) return 'FAILURE_CANNOT_COMPLETE'
				if (modalResult.cards[0].cardId === 'clock') return 'FAILURE_CANNOT_COMPLETE'

				applySingleUse(game)
				retrieveCard(game, modalResult.cards[0])

				return 'SUCCESS'
			},
			onTimeout() {
				// Do nothing
			},
		})
	}
}

export default ChestSingleUseCard
