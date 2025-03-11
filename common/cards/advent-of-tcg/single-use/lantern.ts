import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const Lantern: SingleUse = {
	...singleUse,
	id: 'lantern',
	numericId: 225,
	name: 'Lantern',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 3,
	description:
		'Look at the top 4 cards of your deck, and choose 2 to draw. Show these 2 cards to your opponent.',
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		(_game, pos) => pos.player.getDrawPile().length >= 4,
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			const topCards = player
				.getDrawPile()
				.sort(CardComponent.compareOrder)
				.slice(0, 4)

			game.addModalRequest({
				player: player.entity,
				modal: {
					type: 'selectCards',
					name: 'Lantern',
					description: 'Choose 2 cards to draw immediately.',
					cards: topCards.map((card) => card.entity),
					selectionSize: 2,
					primaryButton: {
						text: 'Confirm Selection',
						variant: 'default',
					},
					cancelable: false,
				},
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'
					if (!modalResult.cards) return 'FAILURE_INVALID_DATA'
					if (modalResult.cards.length !== 2) return 'FAILURE_INVALID_DATA'

					const drawCards = modalResult.cards

					topCards.forEach((card) => {
						if (drawCards.some((c) => c.entity === card.entity)) {
							card.draw()
						}
					})

					game.addModalRequest({
						player: opponentPlayer.entity,
						modal: {
							type: 'selectCards',
							name: 'Lantern',
							description: 'Cards your opponent drew.',
							cards: modalResult.cards.map((card) => card.entity),
							selectionSize: 0,
							primaryButton: {
								text: 'Close',
								variant: 'default',
							},
							cancelable: true,
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
					// Do nothing
				},
			})
		})
	},
}

export default Lantern
