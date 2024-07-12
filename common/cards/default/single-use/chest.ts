import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import {discardSingleUse, retrieveCard} from '../../../utils/movement'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class ChestSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'chest',
		numericId: 4,
		name: 'Chest',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		description: 'Choose one card from your discard pile to return to your hand.',
		attachCondition: query.every(singleUse.attachCondition, (game, pos) => {
			if (pos.player.discarded.filter((card) => card.props.id !== 'clock').length <= 0) return false
			return true
		}),
	}
	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		game.addModalRequest({
			playerId: player.id,
			data: {
				modalId: 'selectCards',
				payload: {
					modalName: 'Chest: Choose a card to retrieve from your discard pile.',
					modalDescription: '',
					cards: player.discarded.map((card) => card.toLocalCardInstance()),
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
				if (modalResult.cards[0].props.id === 'clock') return 'FAILURE_CANNOT_COMPLETE'

				applySingleUse(game)
				retrieveCard(
					game,
					player.discarded.find((card) => card.id === modalResult.cards![0].component) || null
				)

				return 'SUCCESS'
			},
			onTimeout() {
				// Do nothing
			},
		})
	}
}

export default ChestSingleUseCard
