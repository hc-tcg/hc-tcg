import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import PearlescentMoonRare from 'common/cards/hermits/pearlescentmoon-rare'
import PoePoeSkizzRare from 'common/cards/hermits/poepoeskizz-rare'
import SkizzlemanRare from 'common/cards/hermits/skizzleman-rare'
import Anvil from 'common/cards/single-use/anvil'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {
	AussiePingEffect,
	AussiePingImmuneEffect,
} from 'common/status-effects/aussie-ping'
import {testGame} from '../utils'

describe('Test Pearlescent Moon Rare', () => {
	test('Aussie Ping', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [PearlescentMoonRare],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PearlescentMoonRare, 'hermit', 0)
					await test.attack('secondary')
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(AussiePingEffect),
							query.effect.targetEntity(game.opponentPlayer.entity),
						),
					).not.toBe(null)

					await test.endTurn()

					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.active,
							query.row.opponentPlayer,
						)?.health,
					).toBe(PearlescentMoonRare.health)

					await test.endTurn()
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(AussiePingImmuneEffect),
							query.effect.targetEntity(game.opponentPlayer.entity),
						),
					).not.toBe(null)
					await test.attack('secondary')

					// Aussie Ping should be blocked by the AussiePingImmune effect.
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(AussiePingEffect),
							query.effect.targetEntity(game.opponentPlayer.entity),
						),
					).toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Aussie Ping blocks Skizzleman Rare extra damage.', async () => {
		await testGame(
			{
				playerOneDeck: [SkizzlemanRare, Anvil],
				playerTwoDeck: [PearlescentMoonRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(SkizzlemanRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PearlescentMoonRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

					// Give Skizzleman Rare the Aussie Ping effect.
					await test.attack('secondary')
					await test.endTurn()

					// Use Anvil to trigger Skizz's bonus damage.
					await test.playCardFromHand(Anvil, 'single_use')
					await test.attack('secondary')
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 10 /* Anvil damage */)
					expect(
						game.components.find(
							StatusEffectComponent,
							query.effect.is(AussiePingImmuneEffect),
							query.effect.targetEntity(game.opponentPlayer.entity),
						),
					).not.toBe(null)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})

	test('Aussie Ping blocks Poe Poe Skizz Rare extra damage.', async () => {
		await testGame(
			{
				playerOneDeck: [PoePoeSkizzRare],
				playerTwoDeck: [PearlescentMoonRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(PoePoeSkizzRare, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(PearlescentMoonRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)

					// Give Poe Poe Skizz the Aussie Ping effect.
					await test.attack('secondary')
					await test.endTurn()

					await test.attack('secondary')
					await test.pick(
						query.slot.rowIndex(1),
						query.slot.hermit,
						query.slot.currentPlayer,
					)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
