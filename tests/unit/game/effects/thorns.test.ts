import {describe, expect, test} from '@jest/globals'
import ThornsII from 'common/cards/alter-egos/effects/thorns_ii'
import ThornsIII from 'common/cards/alter-egos/effects/thorns_iii'
import Thorns from 'common/cards/default/effects/thorns'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import IronSword from 'common/cards/default/single-use/iron-sword'
import {RowComponent} from 'common/components'
import query from 'common/components/query'
import {attack, endTurn, playCardFromHand, testGame} from '../utils'

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
	test('Test ' + thorns + ' damage after attacks with effect card only', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, thornsMap[thorns].card],
				playerTwoDeck: [EthosLabCommon, IronSword],
				saga: function* (game) {
					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, thornsMap[thorns].card, 'attach', 0)
					yield* endTurn(game)

					yield* playCardFromHand(game, EthosLabCommon, 'hermit', 0)
					yield* playCardFromHand(game, IronSword, 'single_use')
					yield* attack(game, 'single-use')

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
