import {describe, expect, test} from '@jest/globals'
import PythonGBRare from 'common/cards/advent-of-tcg/hermits/pythongb-rare'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import RendogCommon from 'common/cards/hermits/rendog-common'
import XisumavoidRare from 'common/cards/hermits/xisumavoid-rare'
import {GameModel} from 'common/models/game-model'
import {attack, endTurn, playCardFromHand, testGame} from '../../utils'

function* testOneHermit(game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.endTurn()

	await test.playCardFromHand(PythonGBRare, 'hermit', 0)
	await test.playCardFromHand(RendogCommon, 'hermit', 2)
	await test.attack('secondary')
	expect(game.opponentPlayer.activeRow?.health).toBe(
		EthosLabCommon.health - PythonGBRare.secondary.damage,
	)
	await test.endTurn()

	await test.endTurn()

	await test.playCardFromHand(RendogCommon, 'hermit', 1)
	await test.attack('secondary')
	expect(game.opponentPlayer.activeRow?.health).toBe(
		EthosLabCommon.health -
			PythonGBRare.secondary.damage -
			PythonGBRare.secondary.damage * 2,
	)
}

function* testManyHermits(game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
	await test.endTurn()

	await test.playCardFromHand(PythonGBRare, 'hermit', 1)
	await test.playCardFromHand(RendogCommon, 'hermit', 0)
	await test.playCardFromHand(XisumavoidRare, 'hermit', 2)
	await test.attack('secondary')
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
