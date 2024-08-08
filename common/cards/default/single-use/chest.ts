import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import CardOld from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'
import Clock from './clock'

class Chest extends CardOld {
	pickCondition = query.every(
		query.card.currentPlayer,
		query.card.slot(query.slot.discardPile),
		query.not(query.card.is(Clock)),
	)

	props: SingleUse = {
		...singleUse,
		id: 'chest',
		numericId: 4,
		name: 'Chest',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		description:
			'Choose one card from your discard pile and return it to your hand.',
		attachCondition: query.every(singleUse.attachCondition, (game, _pos) => {
			return game.components.exists(CardComponent, this.pickCondition)
		}),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addModalRequest({
			player: player.entity,
			data: {
				modalId: 'selectCards',
				payload: {
					modalName: 'Chest',
					modalDescription: 'Choose a card to retrieve from your discard pile.',
					cards: game.components
						.filter(CardComponent, this.pickCondition)
						.map((card) => card.entity),
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
					component.draw()
					return 'SUCCESS'
				}
				if (!modalResult.cards) return 'FAILURE_INVALID_DATA'
				if (modalResult.cards.length !== 1) return 'FAILURE_CANNOT_COMPLETE'
				if (modalResult.cards[0].props.id === 'clock')
					return 'FAILURE_CANNOT_COMPLETE'

				applySingleUse(game)

				let card = game.components.get(modalResult.cards[0].entity)
				card?.draw()

				return 'SUCCESS'
			},
			onTimeout() {
				// Do nothing
			},
		})
	}
}

export default Chest
