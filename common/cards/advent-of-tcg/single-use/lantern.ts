import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class Lantern extends Card {
	props: SingleUse = {
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
			(_game, pos) => pos.player.getDeck().length >= 4,
		),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			const topCards = player
				.getDeck()
				.sort(CardComponent.compareOrder)
				.slice(0, 4)

			game.addModalRequest({
				player: player.entity,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Lantern',
						modalDescription: 'Choose 2 cards to draw immediately.',
						cards: topCards.map((card) => card.entity),
						selectionSize: 2,
						primaryButton: {
							text: 'Confirm Selection',
							variant: 'default',
						},
					},
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
						data: {
							modalId: 'selectCards',
							payload: {
								modalName: 'Lantern',
								modalDescription: 'Cards your opponent drew.',
								cards: modalResult.cards.map((card) => card.entity),
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
					// Do nothing
				},
			})
		})
	}
}

export default Lantern
