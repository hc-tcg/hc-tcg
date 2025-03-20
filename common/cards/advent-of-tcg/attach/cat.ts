import {
	CardComponent,
	DeckSlotComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {SelectCards} from '../../../types/modal-requests'
import {afterAttack} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const Cat: Attach = {
	...attach,
	id: 'cat',
	numericId: 505,
	name: 'Cat',
	expansion: 'minecraft',
	rarity: 'rare',
	tokens: 1,
	description:
		'After the Hermit this card is attached to attacks, view the top card of your deck. You may choose to move the bottom card of your deck to the top to be drawn next.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.EFFECT_POST_ATTACK_REQUESTS,
			(attack) => {
				if (!component.slot.inRow()) return
				const myHermit = component.slot.row.getHermit()
				if (!myHermit || !attack.isAttacker(myHermit.entity)) return
				if (
					!attack.isType('primary', 'secondary') ||
					query.some(...attack.shouldIgnoreCards)(game, myHermit)
				)
					return

				if (
					!game.components.exists(
						CardComponent,
						query.card.slot(query.slot.currentPlayer, query.slot.deck),
					)
				)
					return

				let currentTopCard = player
					.getDrawPile()
					.sort(CardComponent.compareOrder)[0]

				const modal: SelectCards.Request = {
					player: player.entity,
					modal: {
						type: 'selectCards',
						name: 'Cat - View your top card',
						description: 'Move a card from the bottom of your deck to the top?',
						cards: [currentTopCard.entity],
						selectionSize: 0,
						cancelable: false,
						primaryButton: {
							text: 'Move to top',
							variant: 'primary',
						},
						secondaryButton: {
							text: 'Do nothing',
							variant: 'secondary',
						},
					},
					onResult(modalResult) {
						newObserver.unsubscribeFromEverything()
						if (!modalResult) return 'SUCCESS'
						if (!modalResult.result) return 'SUCCESS'

						player
							.getDrawPile()
							.sort(CardComponent.compareOrder)
							.at(-1)
							?.attach(
								game.components.new(DeckSlotComponent, player.entity, {
									position: 'front',
								}),
							)

						return 'SUCCESS'
					},
					onTimeout() {
						newObserver.unsubscribeFromEverything()
					},
				}

				const newObserver = game.components.new(
					ObserverComponent,
					component.entity,
				)
				const updateModal = () => {
					newObserver.unsubscribe(currentTopCard.hooks.onChangeSlot)
					const topCard = player
						.getDrawPile()
						.sort(CardComponent.compareOrder)
						.at(0)
					if (!topCard) {
						game.removeModalRequest(game.state.modalRequests.indexOf(modal))
						return
					}
					currentTopCard = topCard
					modal.modal.cards = [topCard.entity]
					newObserver.subscribe(topCard.hooks.onChangeSlot, updateModal)
				}

				newObserver.subscribe(currentTopCard.hooks.onChangeSlot, updateModal)
				game.addModalRequest(modal)
			},
		)
	},
}

export default Cat
