import {describe, expect, test} from '@jest/globals'
import OrionSoundRare from 'common/cards/advent-of-tcg/hermits/orionsound-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import Bow from 'common/cards/single-use/bow'
import InvisibilityPotion from 'common/cards/single-use/invisibility-potion'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import MelodyEffect from 'common/status-effects/melody'
import {testGame} from '../../utils'

describe('Test Oli Melody', () => {
	test('Melody functionality', async () => {
		await testGame(
			{
				playerOneDeck: [
					EthosLabCommon,
					Bow,
					InvisibilityPotion,
					InvisibilityPotion,
				],
				playerTwoDeck: [OrionSoundRare, EthosLabCommon],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.endTurn()

					await test.playCardFromHand(OrionSoundRare, 'hermit', 0)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 1)
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.endTurn()

					await test.playCardFromHand(Bow, 'single_use')
					await test.attack('secondary')
					await test.pick(
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
					).toBe(OrionSoundRare.health - EthosLabCommon.secondary.damage)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 + 10)
					await test.attack('primary')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							OrionSoundRare.primary.damage -
							OrionSoundRare.primary.damage,
					)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							OrionSoundRare.primary.damage -
							OrionSoundRare.primary.damage +
							10,
					)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(EthosLabCommon.health - 40 + 20)
					await test.attack('primary')
					await test.pick(
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							OrionSoundRare.primary.damage -
							OrionSoundRare.primary.damage +
							20,
					)
					await test.playCardFromHand(InvisibilityPotion, 'single_use')
					await test.applyEffect()
					await test.attack('secondary')
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						OrionSoundRare.health -
							EthosLabCommon.secondary.damage -
							EthosLabCommon.secondary.damage,
					)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						OrionSoundRare.health -
							EthosLabCommon.secondary.damage -
							EthosLabCommon.secondary.damage +
							10,
					)
					await test.attack('primary')
					expect(game.state.pickRequests).toHaveLength(0)
					await test.endTurn()

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health -
							OrionSoundRare.primary.damage -
							OrionSoundRare.primary.damage +
							30,
					)
					await test.attack('secondary')
					expect(game.opponentPlayer.activeRow).toBe(null)
					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(MelodyEffect),
							query.not(query.effect.targetEntity(null)),
						).length,
					).toBe(0)
				},
			},
			{noItemRequirements: true, forceCoinFlip: true},
		)
	})
})
