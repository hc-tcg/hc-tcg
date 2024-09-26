import {describe, expect, test} from '@jest/globals'
import BdoubleO100Common from 'common/cards/default/hermits/bdoubleo100-common'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import ImpulseSVRare from 'common/cards/default/hermits/impulsesv-rare'
import TangoTekRare from 'common/cards/default/hermits/tangotek-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

function* testOneHermit(game: GameModel) {
	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, ImpulseSVRare, 'hermit', 0)
	yield* playCardFromHand(game, BdoubleO100Common, 'hermit', 1)

	yield* attack(game, 'secondary')

	expect(
		game.components.find(RowComponent, query.row.active)?.health,
	).toStrictEqual(260 - (70 + 40))
}

function* testManyHermits(game: GameModel) {
	yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)

	yield* endTurn(game)

	yield* playCardFromHand(game, ImpulseSVRare, 'hermit', 0)
	yield* playCardFromHand(game, BdoubleO100Common, 'hermit', 1)
	yield* playCardFromHand(game, BdoubleO100Common, 'hermit', 2)
	yield* playCardFromHand(game, TangoTekRare, 'hermit', 3)

	yield* attack(game, 'secondary')

	expect(
		game.components.find(RowComponent, query.row.active)?.health,
	).toStrictEqual(260 - (70 + 40 + 40))
}

describe('Test Impulse Test', () => {
	test('Test Impulse Is Triggered By Bdubs', () => {
		testGame(
			{
				saga: testOneHermit,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ImpulseSVRare, BdoubleO100Common],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Impulse Is Triggered By Multiple Hermits', () => {
		testGame(
			{
				saga: testManyHermits,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [
					ImpulseSVRare,
					BdoubleO100Common,
					BdoubleO100Common,
					TangoTekRare,
				],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})
