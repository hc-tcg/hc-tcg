import {describe, expect, test} from '@jest/globals'
import Biffa2001Rare from 'common/cards/advent-of-tcg/hermits/biffa2001-rare'
import GrianchRare from 'common/cards/advent-of-tcg/hermits/grianch-rare'
import BadOmen from 'common/cards/alter-egos/single-use/bad-omen'
import PotionOfSlowness from 'common/cards/alter-egos/single-use/potion-of-slowness'
import IronArmor from 'common/cards/default/effects/iron-armor'
import Totem from 'common/cards/default/effects/totem'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import MinerDoubleItem from 'common/cards/default/items/miner-rare'
import {InstantHealth} from 'common/cards/default/single-use/instant-health'
import IronSword from 'common/cards/default/single-use/iron-sword'
import Knockback from 'common/cards/default/single-use/knockback'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	changeActiveHermit,
	endTurn,
	pick,
	playCardFromHand,
	removeEffect,
	testGame,
} from '../../utils'

describe('Test Biffa Secondary', () => {
	test("Biffa's Museum functionality", () => {
		testGame({
			playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
			playerTwoDeck: [Biffa2001Rare, MinerDoubleItem, IronArmor, InstantHealth],
			saga: function* (game) {
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
				yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
				yield* endTurn(game)

				yield* playCardFromHand(game, Biffa2001Rare, 'hermit', 0)
				yield* playCardFromHand(game, MinerDoubleItem, 'item', 0, 0)
				yield* attack(game, 'secondary')
				expect(game.opponentPlayer.activeRow?.health).toBe(
					EthosLabCommon.health -
						Biffa2001Rare.secondary.damage -
						20 * 2 /** placed 1 Hermit and 1 Item card */,
				)
				yield* endTurn(game)

				yield* changeActiveHermit(game, 1)
				yield* endTurn(game)

				yield* attack(game, 'secondary')
				expect(game.opponentPlayer.activeRow?.health).toBe(
					EthosLabCommon.health - Biffa2001Rare.secondary.damage,
				)
				yield* endTurn(game)

				yield* changeActiveHermit(game, 2)
				yield* endTurn(game)

				yield* playCardFromHand(game, IronArmor, 'attach', 0)
				yield* playCardFromHand(game, InstantHealth, 'single_use')
				yield* removeEffect(game)
				yield* playCardFromHand(game, InstantHealth, 'single_use')
				yield* pick(
					game,
					query.slot.currentPlayer,
					query.slot.hermit,
					query.slot.active,
				)
				yield* attack(game, 'secondary')
				expect(game.opponentPlayer.activeRow?.health).toBe(
					EthosLabCommon.health -
						Biffa2001Rare.secondary.damage -
						20 * 2 /** placed 1 Attach and used 1 Single Use card */,
				)
				yield* endTurn(game)
			},
		})
	})

	test("Biffa's Museum + Knockback does not knock-out hermit as it is revived", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Totem],
				playerTwoDeck: [Biffa2001Rare, Knockback],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Totem, 'attach', 0)
					// Manually set Etho (1) health to trigger zone
					game.components.find(
						RowComponent,
						query.row.currentPlayer,
						query.row.index(0),
					)!.health = 10
					yield* endTurn(game)

					yield* playCardFromHand(game, Biffa2001Rare, 'hermit', 1)
					yield* playCardFromHand(game, Knockback, 'single_use')
					yield* attack(game, 'secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(10)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test("Biffa's Museum works when a Single Use requires confirmation", () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [Biffa2001Rare, PotionOfSlowness],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Biffa2001Rare, 'hermit', 1)
					yield* playCardFromHand(game, PotionOfSlowness, 'single_use')
					if (!game.state.turn.availableActions.includes('SECONDARY_ATTACK'))
						yield* removeEffect(game)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						EthosLabCommon.health -
							Biffa2001Rare.secondary.damage -
							20 /** placed 1 Hermit card, did not apply the Single Use */,
					)
					yield* endTurn(game)

					expect(
						game.opponentPlayer.getHand().map((card) => card.props),
					).toStrictEqual([PotionOfSlowness])
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	// Test interactions with Grianch which allows two attacks in one turn
	test("Biffa's Museum uses running total against Grianch", () => {
		testGame(
			{
				playerOneDeck: [GrianchRare],
				playerTwoDeck: [Biffa2001Rare, BadOmen, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, GrianchRare, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, Biffa2001Rare, 'hermit', 0)
					yield* playCardFromHand(game, BadOmen, 'single_use')
					yield* applyEffect(game)
					yield* endTurn(game)

					yield* attack(game, 'secondary')
					yield* endTurn(game)

					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							20 /** Iron Sword */ -
							Biffa2001Rare.secondary.damage -
							20 /** Used 1 single use this turn */,
					)
					yield* attack(game, 'secondary')
					expect(game.opponentPlayer.activeRow?.health).toBe(
						GrianchRare.health -
							20 /** Iron Sword */ -
							Biffa2001Rare.secondary.damage -
							20 /** Used 1 single use this turn */ -
							Biffa2001Rare.secondary.damage -
							20 /** Used 1 single use this turn */,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
