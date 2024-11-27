import {describe, expect, test} from '@jest/globals'
import Bundle from 'common/cards/advent-of-tcg/single-use/bundle'
import Feather from 'common/cards/advent-of-tcg/single-use/feather'
import FullBundle from 'common/cards/advent-of-tcg/single-use/full_bundle'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import FishingRod from 'common/cards/single-use/fishing-rod'
import Piston from 'common/cards/single-use/piston'
import {DiamondSword, IronSword} from 'common/cards/single-use/sword'
import TNT from 'common/cards/single-use/tnt'
import {Card} from 'common/cards/types'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {SelectCards} from 'common/types/modal-requests'
import {
	attack,
	endTurn,
	finishModalRequest,
	pick,
	playCardFromHand,
	testGame,
} from '../../utils'

function testBundleSetup(
	card1: Card,
	card2: Card,
	checkResult: (game: GameModel) => any,
	extraCards: Array<Card> = [],
	handCards: Array<Card> = Array(3).fill(EthosLabCommon),
	useBundle: boolean = true,
) {
	test(`Test ${card1.name} and ${card2.name}`, () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					EthosLabCommon,
					Bundle,
					card1,
					card2,
					...handCards,
					...extraCards,
				],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Bundle, 'single_use')
					expect(
						(game.state.modalRequests[0].modal as SelectCards.Data).cards.map(
							(entity) => game.components.get(entity)?.props,
						),
					).toStrictEqual([
						card1,
						card2,
						...handCards.filter((card) => card.category === 'single_use'),
					])
					const cardEntities = (
						game.state.modalRequests[0].modal as SelectCards.Data
					).cards
					yield* finishModalRequest(game, {
						result: true,
						cards: [cardEntities[0], cardEntities[1]],
					})
					expect(
						game.currentPlayer.getHand().map((component) => component.props),
					).toStrictEqual([...handCards, FullBundle])

					yield* finishModalRequest(game, {
						//Opponent view
						result: true,
						cards: [],
					})

					yield* endTurn(game)
					yield* endTurn(game)

					if (useBundle) {
						yield* playCardFromHand(game, FullBundle, 'single_use')
						yield* finishModalRequest(game, {
							result: true,
							cards: [],
						})
					}

					yield* checkResult(game)
				},
			},
			{
				startWithAllCards: false,
			},
		)
	})
}

describe('Test Bundle single use', () => {
	testBundleSetup(
		TNT,
		FishingRod,
		function* (game) {
			expect(
				// Fishing rod
				game.currentPlayer
					.getHand()
					.map((component) => component.props),
			).toStrictEqual([...Array(3).fill(EthosLabCommon), Feather, Feather])

			yield* attack(game, 'single-use')
			expect(game.opponentPlayer.activeRow?.health).toStrictEqual(
				EthosLabCommon.health - 60,
			) // TNT damage
			expect(game.currentPlayer.activeRow?.health).toStrictEqual(
				EthosLabCommon.health - 20,
			) // TNT backlash damage
		},
		[Feather, Feather],
	)
	testBundleSetup(DiamondSword, IronSword, function* (game) {
		yield* attack(game, 'single-use')
		expect(game.opponentPlayer.activeRow?.health).toStrictEqual(
			EthosLabCommon.health - 40 - 20,
		) // Diamond and Iron sword
	})
	testBundleSetup(
		Piston,
		IronSword,
		function* (game) {
			expect(game.currentPlayer.activeRow).toBeDefined()

			const pistonedRow = game.currentPlayer.activeRow!.index + 1
			yield* playCardFromHand(game, EthosLabCommon, 'hermit', pistonedRow)
			yield* playCardFromHand(game, BalancedItem, 'item', pistonedRow, 0)

			yield* playCardFromHand(game, FullBundle, 'single_use')
			yield* finishModalRequest(game, {
				result: true,
				cards: [],
			})

			yield* pick(
				game,
				query.slot.item,
				query.slot.rowIndex(pistonedRow),
				query.slot.has(BalancedItem),
				query.slot.currentPlayer,
			)
			yield* pick(
				game,
				query.slot.row(query.row.active),
				query.slot.item,
				query.slot.empty,
				query.slot.currentPlayer,
			)

			expect(game.currentPlayer.singleUseCardUsed).toBeFalsy()
			const cardEntity = game.components.find(
				CardComponent,
				query.card.is(BalancedItem),
			)
			expect(cardEntity).toBeTruthy()
			const slotQuery = query.every(
				query.slot.active,
				query.slot.item,
				query.slot.currentPlayer,
			)
			expect(slotQuery(game, cardEntity!.slot)).toBeTruthy()

			yield* playCardFromHand(game, IronSword, 'single_use')
			yield* attack(game, 'single-use')

			expect(game.opponentPlayer.activeRow?.health).toStrictEqual(
				EthosLabCommon.health - 20 - 20,
			) // Two iron swords
		},
		[],
		[IronSword, BalancedItem, EthosLabCommon],
		false,
	)
})
