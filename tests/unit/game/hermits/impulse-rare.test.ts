import {describe, expect, test} from '@jest/globals'
import BdoubleO100Common from 'common/cards/hermits/bdoubleo100-common'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import ImpulseSVRare from 'common/cards/hermits/impulsesv-rare'
import TangoTekRare from 'common/cards/hermits/tangotek-rare'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {testGame} from '../utils'

async function testOneHermit(test: TestGameFixture, game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(ImpulseSVRare, 'hermit', 0)
	await test.playCardFromHand(BdoubleO100Common, 'hermit', 1)

	await test.attack('secondary')

	expect(
		game.components.find(RowComponent, query.row.active)?.health,
	).toStrictEqual(260 - (70 + 40))

	await test.endTurn()

	await test.endTurn()

	await test.playCardFromHand(BdoubleO100Common, 'hermit', 2)

	await test.attack('secondary')

	expect(
		game.components.find(RowComponent, query.row.active)?.health,
	).toStrictEqual(260 - (70 + 40) - (70 + 40))
}

async function testManyHermits(test: TestGameFixture, game: GameModel) {
	await test.playCardFromHand(EthosLabCommon, 'hermit', 0)

	await test.endTurn()

	await test.playCardFromHand(ImpulseSVRare, 'hermit', 0)
	await test.playCardFromHand(BdoubleO100Common, 'hermit', 1)
	await test.playCardFromHand(BdoubleO100Common, 'hermit', 2)
	await test.playCardFromHand(TangoTekRare, 'hermit', 3)

	await test.attack('secondary')

	expect(
		game.components.find(RowComponent, query.row.active)?.health,
	).toStrictEqual(260 - (70 + 40 + 40))
}

describe('Test Impulse Test', () => {
	test('Test Impulse Is Triggered By Bdubs Once', async () => {
		await testGame(
			{
				testGame: testOneHermit,
				playerOneDeck: [EthosLabCommon],
				playerTwoDeck: [ImpulseSVRare, BdoubleO100Common, BdoubleO100Common],
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
	test('Test Impulse Is Triggered By Multiple Hermits', async () => {
		await testGame(
			{
				testGame: testManyHermits,
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
