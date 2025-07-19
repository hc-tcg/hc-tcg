import {describe, expect, test} from '@jest/globals'
import Slimeball from 'common/cards/advent-of-tcg/attach/slimeball'
import SmithingTable from 'common/cards/advent-of-tcg/single-use/smithing-table'
import Shield from 'common/cards/attach/shield'
import WaterBucket from 'common/cards/attach/water-bucket'
import EvilXisumaBoss from 'common/cards/boss/hermits/evilxisuma_boss'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import BalancedItem from 'common/cards/items/balanced-common'
import CurseOfVanishing from 'common/cards/single-use/curse-of-vanishing'
import {CardComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import ExBossNineEffect, {
	supplyNineSpecial,
} from 'common/status-effects/exboss-nine'
import SmithingTableEffect from 'common/status-effects/smithing-table'
import {testBossFight, testGame} from '../../utils'

describe('Test Smithing Table', () => {
	test('Using Smithing Table on Water Bucket', async () => {
		await testGame({
			playerOneDeck: [EthosLabCommon, SmithingTable, WaterBucket],
			playerTwoDeck: [EthosLabCommon],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(SmithingTable, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.hand,
					query.slot.has(WaterBucket),
				)
				await test.endTurn()

				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.endTurn()

				await test.playCardFromHand(WaterBucket, 'single_use')
				await test.removeEffect()
				await test.playCardFromHand(WaterBucket, 'attach', 0)
				expect(
					game.components.find(
						CardComponent,
						query.card.currentPlayer,
						query.card.onBoard,
						query.card.is(WaterBucket),
						query.card.hasStatusEffect(SmithingTableEffect),
					),
				).not.toBe(null)
			},
		})
	})

	test('Using Smithing Table on Shield', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, SmithingTable, Shield],
				playerTwoDeck: [EthosLabCommon, CurseOfVanishing],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(SmithingTable, 'single_use')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hand,
						query.slot.has(Shield),
					)
					await test.playCardFromHand(Shield, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					expect(
						game.getPickableSlots(CurseOfVanishing.attachCondition),
					).toStrictEqual([])
					await test.attack('primary')
					expect(
						game.components.find(
							CardComponent,
							query.card.opponentPlayer,
							query.card.is(Shield),
							query.card.slot(query.slot.discardPile),
							query.card.hasStatusEffect(SmithingTableEffect),
						),
					).not.toBe(null)
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Reinforced Slimeball protects against Evil X Boss discarding from row', async () => {
		testBossFight({
			playerDeck: [EthosLabCommon, SmithingTable, Slimeball, BalancedItem],
			testGame: async (test, game) => {
				await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
				await test.playCardFromHand(SmithingTable, 'single_use')
				await test.pick(
					query.slot.currentPlayer,
					query.slot.hand,
					query.slot.has(Slimeball),
				)
				await test.playCardFromHand(Slimeball, 'attach', 0)
				await test.playCardFromHand(BalancedItem, 'item', 0, 0)
				await test.endTurn()

				await test.playCardFromHand(EvilXisumaBoss, 'hermit', 0)
				await test.bossAttack('50DMG', 'HEAL150', 'EFFECTCARD')
				expect(
					game.components.find(
						CardComponent,
						query.card.opponentPlayer,
						query.card.onBoard,
						query.card.hasStatusEffect(SmithingTableEffect),
						query.card.is(Slimeball),
					),
				).not.toBe(null)
				await test.endTurn()

				while (game.state.turn.turnNumber < 18) {
					await test.endTurn()
				}

				supplyNineSpecial(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(ExBossNineEffect),
					)!,
					'NINEATTACHED',
				)
				await test.endTurn()

				expect(
					game.currentPlayer.getDiscarded().map((card) => card.props),
				).toStrictEqual([SmithingTable])
			},
		})
	})
})
