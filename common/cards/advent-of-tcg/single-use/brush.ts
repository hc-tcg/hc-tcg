import {CardComponent} from '../../components'
import {query} from '../../components/query'
import {GameModel} from '../../models/game-model'
import CardOld from '../../base/card'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

class Brush extends CardOld {
	props: SingleUse = {
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
			(_game, pos) => pos.player.pile.length >= 3,
		),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			game.addModalRequest({
				player: player.entity,
				modall: {
					type: 'selectCards',
					payload: {
						modalName: 'Brush',
						modalDescription:
							'Choose cards to place on the top of your deck. Select cards you would like to draw sooner first.',
						cards: player.pile
							.slice(0, 3)
							.map((card) => card.toLocalCardInstance()),
						selectionSize: 3,
						primaryButton: {
							text: 'Confirm Selection',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'
					if (!modalResult.cards) return 'SUCCESS'

					const cards = modalResult.cards

					const topCards: Array<CardComponent> = []
					const bottomCards: Array<CardComponent> = []

					player.pile.slice(0, 3).forEach((c) => {
						if (cards.some((d) => c.id === d.component)) topCards.push(c)
						else bottomCards.push(c)
					})

					player.pile = player.pile.slice(3)
					topCards.reverse().forEach((c) => player.pile.unshift(c))
					bottomCards.forEach((c) => player.pile.push(c))

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

export default Brush
