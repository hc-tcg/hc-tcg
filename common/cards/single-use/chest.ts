import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'
import Clock from './clock'

const pickCondition = query.every(
	query.card.currentPlayer,
	query.card.slot(query.slot.discardPile),
	query.not(query.card.is(Clock)),
)

const Chest: SingleUse = {
	...singleUse,
	id: 'chest',
	numericId: 58,
	name: 'Chest',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	description:
		'Choose one card from your discard pile and return it to your hand.',
	attachCondition: query.every(singleUse.attachCondition, (game, _pos) => {
		return game.components.exists(CardComponent, pickCondition)
	}),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addModalRequest({
			player: player.entity,
			modal: {
				type: 'selectCards',
				name: 'Chest',
				description: 'Choose a card to retrieve from your discard pile.',
				cards: game.components
					.filter(CardComponent, pickCondition)
					.map((card) => card.entity),
				selectionSize: 1,
				primaryButton: {
					text: 'Confirm Selection',
					variant: 'default',
				},
				cancelable: true,
			},
			onResult(modalResult) {
				if (!modalResult.result) {
					// Allow player to cancel using Chest
					component.draw()
					return
				}
				if (!modalResult.cards) return
				if (modalResult.cards.length !== 1) return
				if (modalResult.cards[0].props.id === 'clock') return

				game.components.get(modalResult.cards[0].entity)?.draw()

				applySingleUse(game)
			},
			onTimeout() {
				// Do nothing
			},
		})
	},
}

export default Chest
