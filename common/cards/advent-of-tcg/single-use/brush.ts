import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const Brush: SingleUse = {
	...singleUse,
	id: 'brush',
	numericId: 221,
	name: 'Brush',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	description:
		'View the top 3 cards of your deck, then choose any number to keep on the top of your deck. The rest will be placed on the bottom in their original order.',
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		(_game, pos) => pos.player.getDeck().length >= 3,
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
				.getDeck()
				.sort(CardComponent.compareOrder)
				.slice(0, 3)

			game.addModalRequest({
				player: player.entity,
				modal: {
					type: 'selectCards',
					name: 'Brush',
					description:
						'Choose cards to place on the top of your deck. Select cards you would like to draw sooner first.',
					cards: topCards.map((card) => card.entity),
					selectionSize: [0, 3],
					cancelable: false,
					primaryButton: {
						text: 'Confirm Selection',
						variant: 'default',
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'
					if (!modalResult.result) return 'SUCCESS'

					const cards = modalResult.cards || []

					topCards.forEach((c) => {
						if (cards.some((d) => d.entity === c.entity)) return // Leave selected cards "on top"
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
