import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import IJevinRare from 'common/cards/default/hermits/ijevin-rare'
import Iskall85Common from 'common/cards/default/hermits/iskall85-common'
import {printBoardState} from 'server/utils'
import {attack, endTurn, playCardFromHand, testGame} from './utils'
import NetheriteBoots from 'common/cards/alter-egos-iii/effects/netherite-boots'

describe('Test Netherite Boots', () => {
	test('Test Netherite Boots Prevents 20 Damage', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, NetheriteBoots],
				playerTwoDeck: [EthosLabCommon],
				saga: function* (game) {

				}
			},
			{startWithAllCards: true, noItemRequirements: true},
		)
	})
})

