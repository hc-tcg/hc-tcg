import {take, fork, race} from 'redux-saga/effects'
import playerSockets from '../be-socket'
import CARDS from '../cards'

/*
type PlayerState = {
	hand: Array<string>
	rewards: Array<string>
	pile: Array<string>
	discared: Array<string>
	board: {
		actionRow: number
		rows: Array<BoardRow>
	}
}

type GameState = {
	turn: number
	players: Record<string, PlayerState>
}

*/

function getStarertPack() {
	// ['zombiecleo_common', 'zedaphplays_rare', 'ethoslab_ultra_rare']
	return Object.values(CARDS)
		.filter((card) => card.type === 'hermit')
		.map((card) => card.id)
}

function getPlayerState(playerId) {
	const pack = getStarertPack()
	// TODO - ensure there is at least one hermit on the hand
	return {
		id: playerId,
		hand: pack.slice(0, 70), // 0.7
		rewards: pack.slice(7, 10),
		discarded: [],
		pile: pack.slice(10),
		board: {
			activeRow: 0,
			rows: [],
		},
	}
}

function getGameState(playerOneId, playerTwoId) {
	return {
		turn: 0,
		players: {
			[playerOneId]: getPlayerState(playerOneId),
			[playerTwoId]: getPlayerState(playerTwoId),
		},
	}
}

function makePlayerTake(playerId) {
	return (actionType) => {
		return take(
			(action) => action.type === actionType && action.playerId === playerId
		)
	}
}

// TODO - send list of allowed actio together with game state
function* startGameSaga(playerOneId, playerTwoId) {
	const gameState = getGameState(playerOneId, playerTwoId)

	while (true) {
		gameState.turn++
		playerSockets[playerOneId].emit('GAME_STATE', {
			type: 'GAME_STATE',
			payload: {
				gameState,
				opponentId: playerTwoId,
				availableActions: ['ADD_HERMIT', 'PRIMARY_ATTACK'],
			},
		})
		playerSockets[playerTwoId].emit('GAME_STATE', {
			type: 'GAME_STATE',
			payload: {
				gameState,
				opponentId: playerOneId,
				availableActions: ['WAIT_FOR_TURN'],
			},
		})

		const currentPlayer =
			gameState.turn % 2 === 0
				? gameState.players[playerOneId]
				: gameState.players[playerTwoId]
		const oppositePlayer =
			gameState.turn % 2 === 0
				? gameState.players[playerTwoId]
				: gameState.players[playerOneId]

		const takeP = makePlayerTake(currentPlayer.id)

		while (true) {
			// TODO - Replace addHermit/attachItem/attachEffect with single playCard type
			const turnAction = yield race({
				addHermit: takeP('ADD_HERMIT'),
				attachItem: takeP('ATTACH_ITEM'),
				attachEffect: takeP('ATTACH_EFFECT'),
				replaceHermit: takeP('REPLACE_HERMIT'),
				attack: takeP('ATTACK'),
			})

			if (turnAction.addHermit) {
				const hermitId = turnAction.addHermit.cardId
				const hermitInfo = CARDS[hermitId]
				currentPlayer.board.rows.push({
					hermit: turnAction.addHermit.hermit,
					health: hermitInfo.health,
					effect: null,
					items: [],
				})
			} else if (turnAction.attachItem) {
				const cardId = turnAction.attachItem.cardId
				const hermitId = turnAction.attachItem.hermitId
				const hermitRow = currentPlayer.board.rows.find(
					(row) => row.hermit.id === hermitId
				)
				// handle if no result
				// handle if there are already 3 items
				hermitRow.items.push(cardId)
			} else if (turnAction.attachEffect) {
				const cardId = turnAction.attachEffect.cardId
				const hermitId = turnAction.attachEffect.hermitId
				const hermitRow = currentPlayer.board.rows.find(
					(row) => row.hermit.id === hermitId
				)
				// handle if no result
				// handle if there already is an effect
				hermitRow.effect = cardId
			} else if (turnAction.replaceHermit) {
				const hermitId = turnAction.replaceHermit.hermitId
				// handle if no result
				currentPlayer.board.activeRow = currentPlayer.board.rows.findIndex(
					(row) => row.hermit.id === hermitId
				)
			} else if (turnAction.attack) {
				const {hermitId, type, targetHermitId} = turnAction.attack
				const hermitInfo = HERMITS[hermitId]
				const attackInfo =
					hermitInfo[type === 'primary' ? 'primary' : 'secondary']
				const targetRow = oppositePlayer.board.rows.find(
					(row) => row.hermit.id === targetHermitId
				)
				// you can't attack on first turn
				// handle if not enough items
				// handle if no result
				targetRow.health -= attackInfo.damage
			} else {
				// handle unknown action
			}
			// send new game state to both players
		}
		// draw card
	}
}

function* gameSaga() {
	while (true) {
		const firstRequest = yield take('JOIN_GAME')
		console.log('first player waiting')
		const result = yield race({
			secondRequest: take('JOIN_GAME'),
			disconnected: take(
				(action) =>
					action.type === 'PLAYER_DISCONNECTED' &&
					firstRequest.playerId === action.playerId
			),
		})
		if (result.secondRequest) {
			console.log('second player connected, starting game')
			yield fork(
				startGameSaga,
				firstRequest.playerId,
				result.secondRequest.playerId
			)
		}
	}
}

export default gameSaga
