import {describe, expect, test} from '@jest/globals'
import LightningRod from 'common/cards/attach/lightning-rod'
import Wolf from 'common/cards/attach/wolf'
import DwarfImpulseRare from 'common/cards/hermits/dwarfimpulse-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import FiveAMPearlRare from 'common/cards/hermits/fiveampearl-rare'
import TangoTekCommon from 'common/cards/hermits/tangotek-common'
import GoldenAxe from 'common/cards/single-use/golden-axe'
import {RowComponent, StatusEffectComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {IgnoreAttachSlotEffect} from 'common/status-effects/ignore-attach'
import {TestGameFixture, testGame} from '../utils'

describe('Test Dwarf Impulse Rare', () => {
	test('Test Dwarf Impulse with golden axe.', async () => {
		await testGame(
			{
				playerOneDeck: [DwarfImpulseRare, GoldenAxe],
				playerTwoDeck: [EthosLabCommon, FiveAMPearlRare],
				testGame: async (test: TestGameFixture, game: GameModel) => {
					await test.playCardFromHand(DwarfImpulseRare, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(FiveAMPearlRare, 'hermit', 1)

					await test.endTurn()

					await test.playCardFromHand(GoldenAxe, 'single_use')

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
						)!.health,
					).toBe(EthosLabCommon.health - 80)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)!.health,
					).toBe(FiveAMPearlRare.health - 40)

					await test.endTurn()

					expect(
						game.components.filter(
							StatusEffectComponent,
							query.effect.is(IgnoreAttachSlotEffect),
							query.effect.targetIsCardAnd(query.card.currentPlayer),
						).length,
					).toBe(0)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Dwarf Impulse works with lightning rod.', async () => {
		await testGame(
			{
				playerOneDeck: [DwarfImpulseRare, GoldenAxe],
				playerTwoDeck: [
					TangoTekCommon,
					FiveAMPearlRare,
					EthosLabCommon,
					LightningRod,
					Wolf,
				],
				testGame: async (test: TestGameFixture, game: GameModel) => {
					await test.playCardFromHand(DwarfImpulseRare, 'hermit', 0)

					await test.endTurn()

					await test.playCardFromHand(FiveAMPearlRare, 'hermit', 0)
					await test.playCardFromHand(TangoTekCommon, 'hermit', 1)
					await test.playCardFromHand(EthosLabCommon, 'hermit', 2)

					await test.playCardFromHand(Wolf, 'attach', 0)
					await test.playCardFromHand(LightningRod, 'attach', 2)

					await test.changeActiveHermit(1)

					await test.endTurn()

					await test.playCardFromHand(GoldenAxe, 'single_use')

					await test.attack('secondary')

					await test.pick(
						query.slot.hermit,
						query.slot.opponent,
						query.slot.rowIndex(0),
					)

					// Dwarf impulse should have disabled wolf, so it should not have triggered.
					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.active,
						)?.health,
					).toEqual(DwarfImpulseRare.health)

					// Verify that the attack went through and lightning rod was ignored properly.
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toEqual(TangoTekCommon.health - (80 + 20)) // Type advantage Miner -> Redstone
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toEqual(FiveAMPearlRare.health - 40)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
