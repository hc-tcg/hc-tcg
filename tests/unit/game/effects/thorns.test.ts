import {describe, expect, test} from '@jest/globals'
import {Thorns, ThornsII, ThornsIII} from 'common/cards/attach/thorns'
import EthosLabCommon from 'common/cards/hermits/ethoslab-common'
import {IronSword} from 'common/cards/single-use/sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {testGame} from '../utils'

let thornsMap = {
	Thorns: {
		card: Thorns,
		damage: 20,
	},
	'Thorns II': {
		card: ThornsII,
		damage: 30,
	},
	'Thorns III': {
		card: ThornsIII,
		damage: 40,
	},
}

type ThornsType = keyof typeof thornsMap

function testThorns(thorns: ThornsType) {
	test('Test ' +
		thorns +
		' damage after attacks with effect card only', async () => {
		await testGame(
			{
				playerOneDeck: [EthosLabCommon, thornsMap[thorns].card],
				playerTwoDeck: [EthosLabCommon, IronSword],
				testGame: async (test, game) => {
					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(thornsMap[thorns].card, 'attach', 0)
					await test.endTurn()

					await test.playCardFromHand(EthosLabCommon, 'hermit', 0)
					await test.playCardFromHand(IronSword, 'single_use')
					await test.attack('single-use')

					expect(
						game.components.find(
							RowComponent,
							query.row.currentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(
						EthosLabCommon.health - thornsMap[thorns].damage /*Thorns damage*/,
					)

					expect(
						game.components.find(
							RowComponent,
							query.row.opponentPlayer,
							query.row.index(0),
						)?.health,
					).toBe(EthosLabCommon.health - 20 /*Iron sword damage*/)
				},
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
}

describe('Test Thorns', () => {
	testThorns('Thorns')
	testThorns('Thorns II')
	testThorns('Thorns III')
})
