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
import {
	attack,
	bossAttack,
	endTurn,
	pick,
	playCardFromHand,
	removeEffect,
	testBossFight,
	testGame,
} from '../../utils'

describe('Test Smithing Table', () => {
	test('Using Smithing Table on Water Bucket', () => {
		testGame({
			playerOneDeck: [EthosLabCommon, SmithingTable, WaterBucket],
			playerTwoDeck: [EthosLabCommon],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, SmithingTable, 'single_use')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.hand,
					query.slot.has(WaterBucket),
				)
				yield* endTurn(game)

				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, WaterBucket, 'single_use')
				yield* removeEffect(game)
				yield* playCardFromHand(game, WaterBucket, 'attach', 0)
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

	test('Using Smithing Table on Shield', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, SmithingTable, Shield],
				playerTwoDeck: [EthosLabCommon, CurseOfVanishing],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, SmithingTable, 'single_use')
					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hand,
						query.slot.has(Shield),
					)
					yield* playCardFromHand(game, Shield, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					expect(
						game.getPickableSlots(CurseOfVanishing.attachCondition),
					).toStrictEqual([])
					yield* attack(game, 'primary')
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

	test('Reinforced Slimeball protects against Evil X Boss discarding from row', () => {
		testBossFight({
			playerDeck: [EthosLabCommon, SmithingTable, Slimeball, BalancedItem],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, SmithingTable, 'single_use')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.hand,
					query.slot.has(Slimeball),
				)
				yield* playCardFromHand(game, Slimeball, 'attach', 0)
				yield* playCardFromHand(game, BalancedItem, 'item', 0, 0)
				yield* endTurn(game)

				yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
				yield* bossAttack(game, '50DMG', 'HEAL150', 'EFFECTCARD')
				expect(
					game.components.find(
						CardComponent,
						query.card.opponentPlayer,
						query.card.onBoard,
						query.card.hasStatusEffect(SmithingTableEffect),
						query.card.is(Slimeball),
					),
				).not.toBe(null)
				yield* endTurn(game)

				while (game.state.turn.turnNumber < 18) {
					yield* endTurn(game)
				}

				supplyNineSpecial(
					game.components.find(
						StatusEffectComponent,
						query.effect.is(ExBossNineEffect),
					)!,
					'NINEATTACHED',
				)
				yield* endTurn(game)

				expect(
					game.currentPlayer.getDiscarded().map((card) => card.props),
				).toStrictEqual([SmithingTable])
			},
		})
	})
})
