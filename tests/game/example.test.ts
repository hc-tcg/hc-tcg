import {describe, expect, test} from '@jest/globals'

import {CardClass} from 'common/cards/base/card'
import {GameModel} from 'common/models/game-model'

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

		expect(game.state.turn.turnNumber === 1)
	})
})
