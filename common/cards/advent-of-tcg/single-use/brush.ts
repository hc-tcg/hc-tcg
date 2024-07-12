import {GameModel} from '../../../models/game-model'
import {slot, SlotCondition} from '../../../components/query'
import {CardComponent} from '../../../types/game-state'
import Card, {singleUse, SingleUse} from '../../base/card'

class BrushSingleUseCard extends Card {
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
		attachCondition: slot.every(
			singleUse.attachCondition,
			(game, pos) => pos.player.pile.length >= 3
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = pos

		player.hooks.onApply.add(component, () => {
			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Brush: Choose cards to place on the top of your deck.',
						modalDescription: 'Select cards you would like to draw sooner first.',
						cards: player.pile.slice(0, 3).map((card) => card.toLocalCardInstance()),
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

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default BrushSingleUseCard
