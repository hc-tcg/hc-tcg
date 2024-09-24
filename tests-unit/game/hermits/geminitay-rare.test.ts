import {describe, expect, test} from '@jest/globals'
import IronArmor from 'common/cards/default/effects/iron-armor'
import Totem from 'common/cards/default/effects/totem'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/default/hermits/geminitay-rare'
import ChorusFruit from 'common/cards/default/single-use/chorus-fruit'
import GoldenAxe from 'common/cards/default/single-use/golden-axe'
import IronSword from 'common/cards/default/single-use/iron-sword'
import LavaBucket from 'common/cards/default/single-use/lava-bucket'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import FireEffect from 'common/status-effects/fire'
import {IgnoreAttachSlotEffect} from 'common/status-effects/ignore-attach'
import {
	applyEffect,
	attack,
	endTurn,
	pick,
	playCardFromHand,
	testGame,
} from '../utils'

describe('Test Gemini Tay', () => {
	test('Test Axe Functions Until End Of Turn', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, IronArmor],
				playerTwoDeck: [GeminiTayRare, GoldenAxe, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, IronArmor, 'attach', 0)

					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* playCardFromHand(game, GoldenAxe, 'single_use')

					yield* attack(game, 'secondary')

					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'single-use')

					// We expect that the iron armor attached to etho did not block any damage.
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.active,
						)?.health,
					).toBe(
						EthosLabCommon.health -
							80 /* Gem Secondary */ -
							40 /* Golden Axe */ -
							20 /* Iron Sword*/,
					)

					yield* endTurn(game)

					// We expect that the iron armor attached to etho to no longer be disabled.
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(IgnoreAttachSlotEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						),
					).toBeFalsy()
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})

	test('Test Totem against Lava Bucket then Axe', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Totem],
				playerTwoDeck: [GeminiTayRare, LavaBucket, GoldenAxe],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Totem, 'attach', 0)

					yield* endTurn(game)

					// Manually set Etho (1) health to trigger zone
					game.opponentPlayer.activeRow!.health = 140

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)

					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)

					yield* attack(game, 'secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(FireEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).not.toBe(null)

					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'single-use')

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.index).toBeUndefined()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Totem against Axe then Lava Bucket', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Totem],
				playerTwoDeck: [GeminiTayRare, LavaBucket, GoldenAxe],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)
					yield* playCardFromHand(game, Totem, 'attach', 0)

					yield* endTurn(game)

					// Manually set Etho (1) health to trigger zone
					game.opponentPlayer.activeRow!.health = 140

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)

					yield* playCardFromHand(game, GoldenAxe, 'single_use')
					yield* attack(game, 'secondary')

					yield* playCardFromHand(game, LavaBucket, 'single_use')
					yield* applyEffect(game)

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(FireEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).not.toBe(null)

					yield* endTurn(game)

					expect(game.currentPlayer.activeRow?.index).toBeUndefined()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Chorus Fruit with Gemini Slay', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [GeminiTayRare, EthosLabCommon, ChorusFruit],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, GeminiTayRare, 'hermit', 0)
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 1)

					yield* playCardFromHand(game, ChorusFruit, 'single_use')

					yield* attack(game, 'secondary')

					expect(game.state.pickRequests).toHaveLength(1)

					yield* pick(
						game,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)

					expect(game.currentPlayer.activeRow?.index).toBe(1)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
