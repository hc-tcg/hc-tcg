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
			!!pos.opponentPlayer && pos.opponentPlayer.getDrawPile().length >= 3,
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
				.getDrawPile()
				.sort(CardComponent.compareOrder)
				.slice(0, 3)

			game.addModalRequest({
				player: player.entity,
				modal: {
					type: 'selectCards',
					name: 'Glowstone: Choose the card for your opponent to discard.',
					description:
						'The other two cards will be placed on the bottom of their deck.',
					cards: topCards.map((card) => card.entity),
					selectionSize: 1,
					primaryButton: {
						text: 'Confirm Selection',
						variant: 'default',
					},
					cancelable: false,
				},
				onResult(modalResult) {
					if (!modalResult) return
					if (!modalResult.cards) return
					if (modalResult.cards.length !== 1) return

					const drawCard = modalResult.cards[0]

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
