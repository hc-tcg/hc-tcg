import {CardComponent} from '../../components'
import {query} from '../../components/query'
import {GameModel} from '../../models/game-model'
import CardOld from '../../base/card'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

class Lantern extends CardOld {
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
			(_game, pos) => pos.player.pile.length >= 4,
		),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			game.addModalRequest({
				player: player.entity,
				modall: {
					type: 'selectCards',
					payload: {
						modalName: 'Lantern',
						modalDescription: 'Choose 2 cards to draw immediately.',
						cards: player.pile
							.slice(0, 4)
							.map((card) => card.toLocalCardInstance()),
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

					const cards = modalResult.cards

					player.pile = player.pile.filter((c) => {
						if (cards.some((d) => c.id === d.component)) {
							player.hand.push(c)
							return false
						}
						return true
					})

					game.addModalRequest({
						playerId: opponentPlayer.id,
						modall: {
							type: 'selectCards',
							payload: {
								modalName: 'Lantern',
								modalDescription: 'Cards your opponent drew.',
								cards: modalResult.cards,
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

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default Lantern
