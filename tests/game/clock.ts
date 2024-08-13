import {describe, expect, test} from '@jest/globals'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import Clock from 'common/cards/default/single-use/clock'
import {GameModel} from 'common/models/game-model'
import {getTestPlayer, testSagas} from './utils'
import gameSaga from 'server/routines/game'
import sagaHelper from 'redux-saga-testing'

function* testClockHelperSaga() {}

describe('Test Clock', () => {
	test('Test Clock', () => {
		let game = new GameModel(
			getTestPlayer('player1', [EthosLabCommon]),
			getTestPlayer('player2', [EthosLabCommon, Clock]),
		)

		testSagas(gameSaga(game), testClockHelperSaga)
	})
})
