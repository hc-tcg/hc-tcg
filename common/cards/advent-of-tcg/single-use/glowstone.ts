import {CardComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class Glowstone extends CardOld {
	props: SingleUse = {
		...singleUse,
		id: 'glowstone',
		numericId: 224,
		name: 'Glowstone',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 2,
		description:
			'View the top 3 cards of your opponent’s deck. Choose one for them to draw. The other 2 will be placed on the bottom of their deck in their original order.',
		showConfirmationModal: true,
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			if (!opponentPlayer.pile.length) return // Do nothing if opponent has no more cards to draw
			game.addModalRequest({
				player: player.entity,
				type: 'selectCards',
				modalName: 'Glowstone: Choose the card for your opponent to draw.',
				modalDescription:
					'The other two cards will be placed on the bottom of their deck.',
				cards: opponentPlayer.pile
					.slice(0, 3)
					.map((card) => card.toLocalCardInstance()),
				selectionSize: 1,
				primaryButton: {
					text: 'Confirm Selection',
					variant: 'default',
				},
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'
					if (!modalResult.cards) return 'FAILURE_INVALID_DATA'
					if (modalResult.cards.length !== 1) return 'FAILURE_INVALID_DATA'

					const card = modalResult.cards[0]

					const cards: Array<CardComponent> = []
					const bottomCards: Array<CardComponent> = []

					opponentPlayer.pile.slice(0, 3).forEach((c) => {
						if (card.component === c.id) cards.push(c)
						else bottomCards.push(c)
					})

					opponentPlayer.pile = opponentPlayer.pile.slice(3)
					bottomCards.forEach((c) => opponentPlayer.pile.push(c))

					cards.forEach((c) => opponentPlayer.hand.push(c))

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

export default Glowstone
