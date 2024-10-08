import {CardComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import CardOld from '../../base/card'
import {attach} from '../defaults'
import {Attach} from '../types'

class Cat extends CardOld {
	props: Attach = {
		...attach,
		id: 'cat',
		numericId: 202,
		name: 'Cat',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		description:
			'After the Hermit this card is attached to attacks, view the top card of your deck. You may choose to draw the bottom card of your deck at the end of your turn instead.',
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player} = component
		player.hooks.afterAttack.add(component, (attack) => {
			if (!pos.rowId || !pos.rowId.hermitCard) return
			if (
				attack.id !==
				pos.rowId.hermitCard.card.getInstanceKey(pos.rowId.hermitCard)
			)
				return

			if (player.pile.length === 0) return

			game.addModalRequest({
				player: player.entity,
				modall: {
					type: 'selectCards',
					payload: {
						modalName: 'Cat',
						modalDescription: 'Draw a card from the bottom of your deck?',
						cards: [player.pile[0].toLocalCardInstance()],
						selectionSize: 0,
						primaryButton: {
							text: 'Draw from Bottom',
							variant: 'primary',
						},
						secondaryButton: {
							text: 'Do Nothing',
							variant: 'secondary',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult) return 'SUCCESS'
					if (!modalResult.result) return 'SUCCESS'

					player.hooks.onTurnEnd.add(component, (_drawCards) => {
						player.hooks.onTurnEnd.remove(component)
						return [player.pile[-1]]
					})

					return 'SUCCESS'
				},
				onTimeout() {},
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.afterAttack.remove(component)
	}
}

export default Cat
