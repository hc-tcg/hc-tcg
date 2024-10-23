import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import HypnotizdRare from 'common/cards/hermits/hypnotizd-rare'
import MinerDoubleItem from 'common/cards/items/miner-rare'
import Bow from 'common/cards/single-use/bow'
import Efficiency from 'common/cards/single-use/efficiency'
import {
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from 'common/components'
import query from 'common/components/query'
import EfficiencyEffect from 'common/status-effects/efficiency'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Rare Hypnotizd', () => {
	test('Secondary attack and bow can select different targets', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HypnotizdRare, Bow, MinerDoubleItem],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, HypnotizdRare, 'hermit', 0)
					yield* playCardFromHand(game, MinerDoubleItem, 'item', 0, 0)
					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toHaveLength(2)

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(2),
					)

					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.item,
						query.slot.rowIndex(0),
						query.slot.index(0),
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - HypnotizdRare.secondary.damage)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(EthosLabCommon.health - 40 /*Bow damage*/)

					expect(
						game.components
							.find(
								SlotComponent,
								query.slot.currentPlayer,
								query.slot.item,
								query.slot.rowIndex(0),
								query.slot.index(0),
							)
							?.getCard(),
					).toBe(null)
				},
			},
			{startWithAllCards: true},
		)
	})

	test('Secondary attack can not select AFK target without item card', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [HypnotizdRare, Efficiency],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* endTurn(game)

					yield* playCardFromHand(game, HypnotizdRare, 'hermit', 0)
					yield* playCardFromHand(game, Efficiency, 'single_use')
					yield* applyEffect(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(EfficiencyEffect),
							query.effect.targetIsPlayerAnd(query.player.currentPlayer),
						),
					).not.toBe(null)

					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(EfficiencyEffect),
							query.effect.targetIsPlayerAnd(query.player.currentPlayer),
						),
					).toBe(null)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - HypnotizdRare.secondary.damage)
				},
			},
			{startWithAllCards: true},
		)
	})
})
