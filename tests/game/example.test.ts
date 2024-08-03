import {describe, expect, test} from '@jest/globals'

import {GameModel} from 'common/models/game-model'
import {CardClass} from 'common/cards/base/card'
import {turnSaga} from 'server/routines/game'

function getTestPlayer(playerName: string, deck: Array<CardClass>) {
	return {
		model: {
			name: playerName,
			minecraftName: playerName,
			censoredName: playerName,
		},
		deck,
	}
}

describe('example test module', () => {
	test('example', () => {
		let game = new GameModel(
			getTestPlayer('player1', []),
			getTestPlayer('player2', []),
		)

		let saga = turnSaga(game)
	})
})
