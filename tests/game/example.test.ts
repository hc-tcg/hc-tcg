import {describe, expect, test} from '@jest/globals'

import {GameModel} from 'common/models/game-model'
import {getTestPlayer} from './utils'

describe('example test module', () => {
	test('example', () => {
		let game = new GameModel(
			getTestPlayer('player1', []),
			getTestPlayer('player2', []),
		)

		expect(game.state.turn.turnNumber === 1)
	})
})
