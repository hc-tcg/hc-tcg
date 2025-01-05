import {describe, expect, test} from '@jest/globals'
import {NetheriteArmor} from 'common/cards/attach/armor'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Egg from 'common/cards/single-use/egg'
import TargetBlock from 'common/cards/single-use/target-block'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'
import {DiamondSword, IronSword} from 'common/cards/single-use/sword'

describe('Test Netherite Armor', () => {
	test('Netherite Armor prevents damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - 20)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Netherite Armor prevents knockback', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon, Egg],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteArmor, 'attach', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Egg, 'single_use')
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.opponentPlayer.activeRow?.index).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
	test('Netherite Armor prevents damage from effects', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon, DiamondSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, NetheriteArmor, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, DiamondSword, 'single_use')
					yield* attack(game, 'primary')

					expect(
						game.components.find(
							RowComponent,
							query.row.index(0),
							query.row.opponentPlayer,
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.primary.damage -
							40 /* Diamond Sword */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Netherite Armor does not protect against redirects', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, NetheriteArmor],
				playerTwoDeck: [EthosLabCommon, TargetBlock],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, NetheriteArmor, 'attach', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, TargetBlock, 'single_use')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					yield* attack(game, 'primary')

					expect(
						game.components.find(
							RowComponent,
							query.row.index(0),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health)
					expect(
						game.components.find(
							RowComponent,
							query.row.index(1),
							query.row.opponentPlayer,
						)?.health,
					).toBe(EthosLabCommon.health - EthosLabCommon.primary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
