import {describe, expect, test} from '@jest/globals'
import PythonGBRare from 'common/cards/advent-of-tcg/hermits/pythongb-rare'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import RendogCommon from 'common/cards/default/hermits/rendog-common'
import XisumavoidRare from 'common/cards/default/hermits/xisumavoid-rare'
import {GameModel} from 'common/models/game-model'
import {attack, endTurn, playCardFromHand, testGame} from '../../utils'

function* testOneHermit(game: GameModel) {
	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, PythonGBRare, 'hermit', 0)
	yield* playCardFromHand(game, RendogCommon, 'hermit', 2)
	yield* attack(game, 'secondary')
	expect(game.opponentPlayer.activeRow?.health).toBe(
		EthosLabCommon.health - PythonGBRare.secondary.damage,
	)
	yield* endTurn(game)

	yield* endTurn(game)

	yield* playCardFromHand(game, RendogCommon, 'hermit', 1)
	yield* attack(game, 'secondary')
	expect(game.opponentPlayer.activeRow?.health).toBe(
		EthosLabCommon.health -
			PythonGBRare.secondary.damage -
			PythonGBRare.secondary.damage * 2,
	)
}

function* testManyHermits(game: GameModel) {
	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
	yield* endTurn(game)

	yield* playCardFromHand(game, PythonGBRare, 'hermit', 1)
	yield* playCardFromHand(game, RendogCommon, 'hermit', 0)
	yield* playCardFromHand(game, XisumavoidRare, 'hermit', 2)
	yield* attack(game, 'secondary')
	expect(game.opponentPlayer.activeRow?.health).toBe(
		EthosLabCommon.health - PythonGBRare.secondary.damage * 2 * 2,
	)
}

describe('Test PythonGB Logfellas', () => {
	test('Test Python Is Triggered By Adjacent Rendog', () => {
		testGame(
			{
				saga: testOneHermit,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [PythonGBRare, RendogCommon, RendogCommon],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Python Is Triggered By Multiple Hermits', () => {
		testGame(
			{
				saga: testManyHermits,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [PythonGBRare, RendogCommon, XisumavoidRare],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
