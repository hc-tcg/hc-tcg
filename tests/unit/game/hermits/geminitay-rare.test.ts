import {describe, expect, test} from '@jest/globals'
import {IronArmor} from 'common/cards/attach/armor'
import Totem from 'common/cards/attach/totem'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import ChorusFruit from 'common/cards/single-use/chorus-fruit'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import LavaBucket from 'common/cards/single-use/lava-bucket'
import {IronSword} from 'common/cards/single-use/sword'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import FireEffect from 'common/status-effects/fire'
import {IgnoreAttachSlotEffect} from 'common/status-effects/ignore-attach'
import {testGame} from '../utils'

describe('Test Gemini Tay', () => {
	test('Test Axe Functions Until End Of Turn', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, IronArmor],
				playerTwoDeck: [GeminiTayRare, GoldenAxe, IronSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(IronArmor, 'attach', 0)

					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(GoldenAxe, 'single_use')

					await test.attack('secondary')

					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('single-use')

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

					await test.endTurn()

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

	test('Test Totem against Lava Bucket then Axe', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Totem],
				playerTwoDeck: [GeminiTayRare, LavaBucket, GoldenAxe],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Totem, 'attach', 0)

					await test.endTurn()

					// Manually set Etho (1) health to trigger zone
					game.opponentPlayer.activeRow!.health = 140

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)

					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()

					await test.attack('secondary')

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(FireEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).not.toBe(null)

					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('single-use')

					await test.endTurn()

					expect(game.currentPlayer.activeRow?.index).toBeUndefined()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Totem against Axe then Lava Bucket', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon, Totem],
				playerTwoDeck: [GeminiTayRare, LavaBucket, GoldenAxe],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.playCardFromHand(Totem, 'attach', 0)

					await test.endTurn()

					// Manually set Etho (1) health to trigger zone
					game.opponentPlayer.activeRow!.health = 140

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)

					await test.playCardFromHand(GoldenAxe, 'single_use')
					await test.attack('secondary')

					await test.playCardFromHand(LavaBucket, 'single_use')
					await test.applyEffect()

					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(FireEffect),
							query.effect.targetIsCardAnd(query.card.opponentPlayer),
						),
					).not.toBe(null)

					await test.endTurn()

					expect(game.currentPlayer.activeRow?.index).toBeUndefined()
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Test Chorus Fruit with Gemini Slay', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [GeminiTayRare, EthosLabCommon, ChorusFruit],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

					await test.playCardFromHand(ChorusFruit, 'single_use')

					await test.attack('secondary')

					expect(game.state.pickRequests).toHaveLength(1)

					await test.pick(
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
