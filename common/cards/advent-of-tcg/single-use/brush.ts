import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const Brush: SingleUse = {
	...singleUse,
	id: 'brush',
	numericId: 221,
	name: 'Brush',
	expansion: 'advent_of_tcg',
	rarity: 'common',
	tokens: 0,
	description:
		'View the top 2 cards of your deck, then choose any number to keep on the top of your deck. The rest will be placed on the bottom of your deck.',
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		(_game, pos) => pos.player.getDrawPile().length >= 3,
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			const topCards = player
				.getDrawPile()
				.sort(CardComponent.compareOrder)
				.slice(0, 2)

			game.addModalRequest({
				player: player.entity,
				modal: {
					type: 'dragCards',
					name: 'Brush',
					description:
						'Drag cards to put them on the top or bottom of your deck. Cards closer to the right will be drawn first.',
					leftCards: [],
					rightCards: topCards.map((card) => card.entity),
					leftAreaName: 'Bottom of Deck',
					leftAreaMax: null,
					rightAreaName: 'Top of Deck',
					rightAreaMax: null,
				},
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'
					if (!modalResult.result) return 'SUCCESS'

					modalResult.rightCards.reverse().forEach((c) => {
						c.attach(
							game.components.new(DeckSlotComponent, player.entity, {
								position: 'front',
							}),
						)
					})

					modalResult.leftCards.forEach((c) => {
						c.attach(
							game.components.new(DeckSlotComponent, player.entity, {
								position: 'back',
							}),
						)
					})

					return 'SUCCESS'
				},
				onTimeout() {
					// Do nothing
				},
			})
		})
	},
}

export default Brush
