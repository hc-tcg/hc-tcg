import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const Cat: Attach = {
	...attach,
	id: 'cat',
	numericId: 202,
	name: 'Cat',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 1,
	description:
		'After the Hermit this card is attached to attacks, view the top card of your deck. You may choose to draw the bottom card of your deck at the end of your turn instead.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component
		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!component.slot.inRow()) return
			if (!attack.isAttacker(component.slot.row.getHermit()?.entity)) return

			if (
				game.components.exists(
					CardComponent,
					query.card.slot(query.slot.currentPlayer, query.slot.deck),
				)
			)
				return

			game.addModalRequest({
				player: player.entity,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Cat: Draw a card from the bottom of your deck?',
						modalDescription: '',
						cards: [
							player.getDeck().sort(CardComponent.compareOrder)[0].entity,
						],
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

					observer.oneShot(player.hooks.onTurnEnd, (drawCards) => {
						drawCards[0]?.attach(
							game.components.new(DeckSlotComponent, player.entity, {
								position: 'front',
							}),
						)
						drawCards[0] =
							player.getDeck().sort(CardComponent.compareOrder).at(-1) || null
						drawCards[0]?.draw()
					})

					return 'SUCCESS'
				},
				onTimeout() {},
			})
		})
	},
}

export default Cat
