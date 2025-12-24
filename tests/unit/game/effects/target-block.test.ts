import {describe, expect, test} from '@jest/globals'
import GeminiTayRare from 'common/cards/hermits/geminitay-rare'
import FishingRod from 'common/cards/single-use/fishing-rod'
import TargetBlock from 'common/cards/single-use/target-block'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {TurnAction} from 'common/types/game-state'
import {testGame} from '../utils'

describe('Test Target Block', () => {
	test('Test Target Block Acts Next Turn (and Works) (and Gem Does Not Reallow SUs)', async () => {
		await testGame(
			{
				playerOneDeck: [GeminiTayRare, GeminiTayRare],
				playerTwoDeck: [GeminiTayRare, TargetBlock, FishingRod],
				testGame: async (test, game) => {
					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(GeminiTayRare, 'hermit', 1)
					await test.endTurn()

					await test.playCardFromHand(GeminiTayRare, 'hermit', 0)
					await test.playCardFromHand(TargetBlock, 'single_use')
					await test.pick(
						query.slot.opponent,
						query.slot.hermit,
						query.slot.rowIndex(1),
					)
					await test.attack('secondary')

					expect(game.state.turn.availableActions).toContain(
						'PLAY_SINGLE_USE_CARD' satisfies TurnAction,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(GeminiTayRare.health - GeminiTayRare.secondary.damage)

					await test.endTurn()

					await test.endTurn()

					expect(game.state.turn.availableActions).not.toContain(
						'PLAY_SINGLE_USE_CARD' satisfies TurnAction,
					)

					await test.attack('secondary')

					expect(game.state.turn.availableActions).not.toContain(
						'PLAY_SINGLE_USE_CARD' satisfies TurnAction,
					)
					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(1),
						)?.health,
					).toBe(GeminiTayRare.health - GeminiTayRare.secondary.damage)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
