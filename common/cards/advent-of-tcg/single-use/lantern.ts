import {GameModel} from '../../../models/game-model'
import {query} from '../../../components/query'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class LanternSingleUseCard extends Card {
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
			(game, pos) => pos.player.pile.length >= 4
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Lantern: Choose 2 cards to draw immediately.',
						modalDescription: '',
						cards: player.pile.slice(0, 4).map((card) => card.toLocalCardInstance()),
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
						data: {
							modalId: 'selectCards',
							payload: {
								modalName: 'Lantern: Cards your opponent drew.',
								modalDescription: '',
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

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default LanternSingleUseCard
