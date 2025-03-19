import {describe, expect, test} from '@jest/globals'
import LightningRod from 'common/cards/attach/lightning-rod'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import PrincessGemRare from 'common/cards/hermits/princessgem-rare'
import Bow from 'common/cards/single-use/bow'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import TargetBlock from 'common/cards/single-use/target-block'
import {CardComponent, RowComponent} from 'common/components'
import query from 'common/components/query'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Lightning Rod', () => {
	test('Test redirecting multiple attacks at once', () => {
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					EthosLabCommon,
					LightningRod,
				],
				playerTwoDeck: [EthosLabCommon, Bow],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 2)
					yield* playCardFromHand(game, LightningRod, 'attach', 2)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, Bow, 'single_use')
					yield* attack(game, 'primary')
					yield* pick(
						game,
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
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
					).toBe(EthosLabCommon.health)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(2),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							EthosLabCommon.primary.damage -
							40 /*bow damage*/,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Lightning Rod is not discarded when overridden', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, LightningRod],
				playerTwoDeck: [EthosLabCommon, TargetBlock],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
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
							CardComponent,
							query.card.is(LightningRod),
							query.card.opponentPlayer,
							query.card.afk,
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Lightning Rod is not discarded from missed attacks', () => {
		// Practically includes 0-damage atttacks.
		testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					EthosLabCommon,
					LightningRod,
					InvisibilityPotion,
				],
				playerTwoDeck: [EthosLabCommon, TargetBlock],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)
					yield* playCardFromHand(game, InvisibilityPotion, 'single_use')

					yield* applyEffect(game)

					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* attack(game, 'primary')

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(LightningRod),
							query.card.currentPlayer,
							query.card.afk,
						),
					).not.toBe(null)
				},
			},
			{
				startWithAllCards: true,
				noItemRequirements: true,
				forceCoinFlip: true,
			},
		)
	})
	test('Rod discards from 0 damage due to Royal Protection', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, PrincessGemRare, LightningRod],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, PrincessGemRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, LightningRod, 'attach', 1)

					yield* attack(game, 'secondary')

					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					yield* endTurn(game)

					yield* attack(game, 'primary')

					yield* endTurn(game)

					expect(
						game.components.find(
							CardComponent,
							query.card.is(LightningRod),
							query.card.currentPlayer,
							query.card.afk,
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
