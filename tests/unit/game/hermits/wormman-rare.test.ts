import {describe, expect, test} from '@jest/globals'
import ArmorStand from 'common/cards/attach/armor-stand'
import {ThornsIII} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HumanCleoRare from 'common/cards/hermits/humancleo-rare'
import PoultrymanCommon from 'common/cards/hermits/poultryman-common'
import WormManRare from 'common/cards/hermits/wormman-rare'
import Anvil from 'common/cards/single-use/anvil'
import Bow from 'common/cards/single-use/bow'
import TargetBlock from 'common/cards/single-use/target-block'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {WEAKNESS_DAMAGE} from 'common/const/damage'
import {TurnAction} from 'common/types/game-state'
import {
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Rare Worm Man', () => {
	test('Total Anonymity functionality', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, TargetBlock],
				playerTwoDeck: [WormManRare, PoultrymanCommon, PoultrymanCommon],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(WormManRare, 'hermit', 0)
					await test.attack('secondary')
					await test.playCardFromHand(PoultrymanCommon, 'hermit', 1)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(true)
					expect(game.state.turn.availableActions).not.toContain(
						'PLAY_HERMIT_CARD' satisfies TurnAction,
					)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					await test.attack('secondary')
					await test.playCardFromHand(PoultrymanCommon, 'hermit', 2)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(2)),
						)?.turnedOver,
					).toBe(true)
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					yield* changeActiveHermit(game, 1)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(false)
					yield* endTurn(game)

					await test.playCardFromHand(TargetBlock, 'single_use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.attack('secondary')
					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.rowIndex(2)),
						)?.turnedOver,
					).toBe(false)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('One Hermit can be placed face-up after Thorns knock-out', () => {
		testGame(
			{
				playerOneDeck: [
					WormManRare,
					ArmorStand,
					PoultrymanCommon,
					PoultrymanCommon,
				],
				playerTwoDeck: [EthosLabCommon, ThornsIII],
				saga: async (test, game) => {
					await test.playCardFromHand(WormManRare, 'hermit', 0)
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					yield* endTurn(game)

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(ThornsIII, 'attach', 0)
					await test.attack('secondary')
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					await test.attack('secondary')
					yield* changeActiveHermit(game, 1)
					await test.playCardFromHand(PoultrymanCommon, 'hermit', 2)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(2)),
						)?.turnedOver,
					).toBe(false)
					expect(game.state.turn.availableActions).not.toContain(
						'PLAY_HERMIT_CARD' satisfies TurnAction,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Total Anonymity can place Armor Stand', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [WormManRare, ArmorStand],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(WormManRare, 'hermit', 0)
					await test.attack('secondary')
					await test.playCardFromHand(ArmorStand, 'hermit', 1)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(true)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Face-down hermits are revealed when picked, not attacked/attached to', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, Anvil, Bow],
				playerTwoDeck: [WormManRare, PoultrymanCommon, ThornsIII],
				saga: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(WormManRare, 'hermit', 0)
					await test.attack('secondary')
					await test.playCardFromHand(PoultrymanCommon, 'hermit', 1)
					yield* endTurn(game)

					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('single-use')
					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.hermit, query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(true)
					yield* endTurn(game)

					await test.playCardFromHand(ThornsIII, 'attach', 1)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.hermit, query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(true)
					yield* endTurn(game)

					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('single-use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.hermit, query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(false)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Total Anonymity interactions with Betrayed effect', () => {
		testGame(
			{
				playerOneDeck: [WormManRare, EthosLabCommon],
				playerTwoDeck: [HumanCleoRare],
				saga: async (test, game) => {
					await test.playCardFromHand(WormManRare, 'hermit', 0)
					yield* endTurn(game)

					await test.playCardFromHand(HumanCleoRare, 'hermit', 0)
					await test.attack('secondary')
					yield* endTurn(game)

					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health -
							WormManRare.secondary.damage -
							WEAKNESS_DAMAGE /** Prankster -> PvP */,
					)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(true)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					yield* endTurn(game)

					await test.attack('secondary')
					yield* endTurn(game)

					await test.attack('secondary')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(false)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health -
							WormManRare.secondary.damage -
							WEAKNESS_DAMAGE /** Prankster -> PvP */,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - WormManRare.secondary.damage)
					yield* endTurn(game)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
