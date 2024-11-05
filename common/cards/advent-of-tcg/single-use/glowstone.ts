import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const Glowstone: SingleUse = {
	...singleUse,
	id: 'glowstone',
	numericId: 224,
	name: 'Glowstone',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	description:
		"View the top 3 cards of your opponent's deck. Choose one for them to discard. The other 2 will be placed on the bottom of their deck in their original order.",
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		(_game, pos) =>
			!!pos.opponentPlayer && pos.opponentPlayer.getDeck().length >= 3,
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			const topCards = opponentPlayer
				.getDeck()
				.sort(CardComponent.compareOrder)
				.slice(0, 3)

			game.addModalRequest({
				player: player.entity,
				modal: {
					type: 'dragCards',
					name: 'Glowstone',
					description:
						"Drag cards to put on the bottom of the opponent's deck or to discard.",
					leftCards: topCards.splice(1).map((card) => card.entity),
					rightCards: [topCards[0].entity],
					leftAreaName: 'Bottom of Deck',
					leftAreaMax: 2,
					rightAreaName: 'Discard',
					rightAreaMax: 1,
				},
				onResult(modalResult) {
					if (!modalResult) return
					if (!modalResult.rightCards) return
					if (modalResult.rightCards.length !== 1) return

					const drawCard = modalResult.rightCards[0]

					topCards.forEach((card) => {
						if (drawCard.entity === card.entity) card.discard()
						else
							card.attach(
								game.components.new(DeckSlotComponent, opponentPlayer.entity, {
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

export default Glowstone
