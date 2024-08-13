import {Card} from 'common/cards/base/types'
import {PlayerComponent} from 'common/components'
import {GameModel} from 'common/models/game-model'
import {applyMiddleware, createStore} from 'redux'
import createSagaMiddleware from 'redux-saga'
import gameSaga from 'server/routines/game'
import {call, race} from 'typed-redux-saga'

export function getTestPlayer(playerName: string, deck: Array<Card>) {
	return {
		model: {
			name: playerName,
			minecraftName: playerName,
			censoredName: playerName,
		},
		deck,
	}
}

export function findCardInHand(player: PlayerComponent, card: Card) {
	let cardInHand = player
		.getHand()
		.find((cardComponent) => cardComponent.props.id === card.id)
	if (!cardInHand) throw new Error(`Could not find card \`${card.id}\` in hand`)
	return cardInHand
}

export function testSagas(rootSaga: any, testingSaga: any) {
	const sagaMiddleware = createSagaMiddleware()
	createStore(() => {}, applyMiddleware(sagaMiddleware))
	sagaMiddleware.run(function* () {
		yield* race([rootSaga, testingSaga])
	})
}

/** Test a saga against a game. The game is created with sane default settings. */
export function testGame(options: {
	saga: any
	playerOneDeck: Array<Card>
	playerTwoDeck: Array<Card>
}) {
	let game = new GameModel(
		getTestPlayer('player1', options.playerOneDeck),
		getTestPlayer('player2', options.playerTwoDeck),
		{
			maxTurnTime: 90 * 1000,
			extraActionTime: 30 * 1000,
			showHooksState: {
				enabled: true,
				clearConsole: false,
			},
			blockedActions: [],
			availableActions: [],
			autoEndTurn: false,
			disableDeckOut: true,
			startWithAllCards: true,
			unlimitedCards: false,
		},
		{randomizeOrder: false},
	)

	testSagas(call(gameSaga, game), call(options.saga, game))
}
