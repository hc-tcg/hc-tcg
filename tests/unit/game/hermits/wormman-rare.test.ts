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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, WormManRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, PoultrymanCommon, 'hermit', 1)
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

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, PoultrymanCommon, 'hermit', 2)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(2)),
						)?.turnedOver,
					).toBe(true)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
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

					yield* playCardFromHand(game, TargetBlock, 'single_use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					yield* attack(game, 'secondary')
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
				saga: function* (game) {
					yield* playCardFromHand(game, WormManRare, 'hermit', 0)
					yield* playCardFromHand(game, ArmorStand, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, ThornsIII, 'attach', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* changeActiveHermit(game, 1)
					yield* playCardFromHand(game, PoultrymanCommon, 'hermit', 2)
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, WormManRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, ArmorStand, 'hermit', 1)
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
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, WormManRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* playCardFromHand(game, PoultrymanCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, Anvil, 'single_use')
					yield* attack(game, 'single-use')
					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.slot(query.slot.hermit, query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(true)
					yield* endTurn(game)

					yield* playCardFromHand(game, ThornsIII, 'attach', 1)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.hermit, query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(true)
					yield* endTurn(game)

					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'single-use')
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
				saga: function* (game) {
					yield* playCardFromHand(game, WormManRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, HumanCleoRare, 'hermit', 0)
					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						HumanCleoRare.health - WormManRare.secondary.damage,
					)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					expect(
						game.components.find(
							CardComponent,
							query.card.currentPlayer,
							query.card.slot(query.slot.rowIndex(1)),
						)?.turnedOver,
					).toBe(true)
					expect(game.state.turn.availableActions).toContain('END_TURN')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* attack(game, 'secondary')
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
						HumanCleoRare.health - WormManRare.secondary.damage,
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
