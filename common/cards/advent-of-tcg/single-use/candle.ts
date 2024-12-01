import assert from 'assert'
import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {fisherYatesShuffle} from '../../../utils/fisher-yates'
import {singleUse} from '../../defaults'
import {SingleUse} from '../../types'

const Candle: SingleUse = {
	...singleUse,
	id: 'candle',
	numericId: 250,
	name: 'Candle',
	expansion: 'advent_of_tcg_ii',
	rarity: 'rare',
	tokens: 2,
	description:
		'Search your deck for a pair of cards. For one pair you find, draw one copy, discard the other, then shuffle.',
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		(_game, slot) => slot.player.getDeck().length >= 2,
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		const shuffleDeck = () => {
			const deckCards = player.getDeck()
			const newOrder = fisherYatesShuffle(
				deckCards.map((card) => {
					assert(card.slot.inDeck())
					return card.slot.order
				}),
				game.rng,
			)
			deckCards.forEach((card, i) => {
				assert(card.slot.inDeck())
				card.slot.order = newOrder[i]
			})
			deckCards.forEach((card) => card.hooks.onChangeSlot.call(card.slot))
		}

		observer.subscribe(player.hooks.onApply, () => {
			const filteredCards = player
				.getDeck()
				.filter(
					(card, i, deckPile) =>
						deckPile.findIndex(
							(other, j) => other.props === card.props && i !== j,
						) > i,
				)

			game.addModalRequest({
				player: player.entity,
				modal: {
					type: 'selectCards',
					name: 'Candle: Choose a card to draw immediately.',
					description: filteredCards.length
						? 'A copy from your deck will also be discarded'
						: 'Your deck only contains unique cards.',
					cards: filteredCards.map((card) => card.entity),
					selectionSize: filteredCards.length && 1,
					primaryButton: filteredCards.length
						? {
								text: 'Confirm',
								variant: 'default',
							}
						: null,
					secondaryButton: {
						text: 'Shuffle Only',
						variant: 'default',
					},
					cancelable: false,
				},
				onResult(modalResult) {
					if (modalResult.cards?.length === 1) {
						const copies = game.components.filter(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.deck),
							query.card.is(modalResult.cards[0].props),
						)
						copies[0]?.draw()
						copies[1]?.discard()
					}

					shuffleDeck()
				},
				onTimeout() {
					shuffleDeck()
				},
			})
		})
	},
}

export default Candle
