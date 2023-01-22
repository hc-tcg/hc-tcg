import {take, spawn, actionChannel, call} from 'redux-saga/effects'
import {buffers} from 'redux-saga'
import CARDS from '../cards'
import DAMAGE from '../const/damage'
import {
	equalCard,
	hasEnoughItems,
	discardSingleUse,
	hasSingleUse,
} from '../utils'
import {getGameState, getEmptyRow} from '../utils/state-gen'
import attackSaga, {ATTACK_TO_ACTION} from './turn-actions/attack'
import playCardSaga from './turn-actions/play-card'
import changeActiveHermitSaga from './turn-actions/change-active-hermit'
import applyEffectSaga from './turn-actions/apply-effect'

// TURN ACTIONS:
// 'WAIT_FOR_TURN',
// 'ADD_HERMIT',
// 'PRIMARY_ATTACK',
// 'SECONDARY_ATTACK',
// 'CHANGE_ACTIVE_HERMIT',
// 'PLAY_ITEM_CARD',
// 'PLAY_EFFECT_CARD',
// 'PLAY_SINGLE_USE_CARD',
// 'END_TURN'

function getAvailableActions(
	turn,
	pastTurnActions,
	playerState,
	opponentState
) {
	const actions = []
	if (playerState.board.activeRow !== null) {
		actions.push('END_TURN')
	}
	if (
		!pastTurnActions.includes('APPLY_EFFECT') &&
		playerState.board.singleUseCard &&
		!playerState.board.singleUseCardUsed
	) {
		actions.push('APPLY_EFFECT')
	}

	// Player can't change active hermit if I he has no other hermits
	const hasOtherHermit = playerState.board.rows.some(
		(row, index) => row.hermitCard && index !== playerState.board.activeRow
	)
	const chorusFruit = hasSingleUse(playerState, 'chorus_fruit')
	if (
		pastTurnActions.includes('ATTACK') ||
		pastTurnActions.includes('CHANGE_ACTIVE_HERMIT')
	) {
		if (
			chorusFruit &&
			hasOtherHermit &&
			!pastTurnActions.includes('CHANGE_ACTIVE_HERMIT')
		)
			actions.push('CHANGE_ACTIVE_HERMIT')
		return actions
	}

	// TODO - add more conditions (e.g. you can't change active hermit if there is only one.
	// or you can't add more hermits if all rows are filled)
	actions.push('ADD_HERMIT')

	if (hasOtherHermit) actions.push('CHANGE_ACTIVE_HERMIT')

	const {activeRow, rows} = playerState.board
	if (activeRow !== null) {
		actions.push('PLAY_EFFECT_CARD')

		if (turn > 1) {
			const hermitInfo = CARDS[rows[activeRow].hermitCard.cardId]
			const itemCards = rows[activeRow].itemCards.filter(Boolean)

			if (
				!playerState.board.singleUseCardUsed &&
				DAMAGE[playerState.board.singleUseCard?.cardId]
			) {
				actions.push('ZERO_ATTACK')
			}
			if (hasEnoughItems(itemCards, hermitInfo.primary.cost)) {
				actions.push('PRIMARY_ATTACK')
			}
			if (hasEnoughItems(itemCards, hermitInfo.secondary.cost)) {
				actions.push('SECONDARY_ATTACK')
			}
		}
	}

	if (!pastTurnActions.includes('PLAY_ITEM_CARD'))
		actions.push('PLAY_ITEM_CARD')
	if (!pastTurnActions.includes('PLAY_SINGLE_USE_CARD'))
		actions.push('PLAY_SINGLE_USE_CARD')

	return actions
}

function playerAction(actionType, playerId) {
	return (action) => action.type === actionType && action.playerId === playerId
}

// return false in case one player is dead
function* checkHermitHealth(gameState) {
	// TODO - In next turn the opponent must pick new active hermit
	const playerStates = Object.values(gameState.players)
	for (let playerState of playerStates) {
		const playerRows = playerState.board.rows
		const activeRow = playerState.board.activeRow
		for (let rowIndex in playerRows) {
			const row = playerRows[rowIndex]
			if (row.hermitCard && row.health <= 0) {
				playerRows[rowIndex] = getEmptyRow()
				if (Number(rowIndex) === activeRow) {
					playerState.board.activeRow = null
				}
				playerState.lives -= 1
			}
		}

		const isDead = playerState.lives <= 0
		const noHermitsLeft =
			gameState.turn > 1 &&
			playerState.board.rows.every((row) => !row.hermitCard)
		if (isDead || noHermitsLeft) {
			console.log('Player dead: ', {
				isDead,
				noHermitsLeft,
				turn: gameState.turn,
			})
			return false
		}
	}

	return true
}

function* gameSaga(allPlayers, gamePlayerIds) {
	// TODO - gameState should be changed only in immutable way so that we can check its history
	const gameState = getGameState(allPlayers, gamePlayerIds)
	let turnActionChannel = null

	while (true) {
		gameState.turn++
		const pastTurnActions = []

		// TODO - respect gameState.order
		const currentPlayerId = gameState.order[(gameState.turn + 1) % 2]
		const opponentPlayerId = gameState.order[gameState.turn % 2]
		const currentPlayer = gameState.players[currentPlayerId]
		const opponentPlayer = gameState.players[opponentPlayerId]

		gameState.turnPlayerId = currentPlayer.id

		console.log('NEW TURN: ', {currentPlayerId, opponentPlayerId})

		if (turnActionChannel) turnActionChannel.close()
		turnActionChannel = yield actionChannel(
			[
				'PLAY_CARD',
				'CHANGE_ACTIVE_HERMIT',
				'APPLY_EFFECT',
				'ATTACK',
				'END_TURN',
			].map((type) => playerAction(type, currentPlayer.id)),
			buffers.dropping(10)
		)

		while (true) {
			// TODO - Decide player order
			// TODO - Make sure on server that player waiting for turn can't make actions

			const availableActions = getAvailableActions(
				gameState.turn,
				pastTurnActions,
				currentPlayer,
				opponentPlayer
			)
			// TODO - omit state clients shouldn't see (e.g. other players hand, either players pile etc.)
			gamePlayerIds.forEach((playerId) => {
				allPlayers[playerId].socket.emit('GAME_STATE', {
					type: 'GAME_STATE',
					payload: {
						gameState,
						opponentId: gamePlayerIds.find((id) => id !== playerId),
						availableActions:
							playerId === currentPlayerId
								? availableActions
								: ['WAIT_FOR_TURN'],
					},
				})
			})

			console.log('Waiting for turn action')

			const turnAction = yield take(turnActionChannel)

			// TODO - avoid having socket in actions
			const {socket, ...logTurnAction} = turnAction
			console.log('TURN ACTION: ', logTurnAction)

			const state = {
				gameState,
				currentPlayer,
				opponentPlayer,
				pastTurnActions,
				availableActions,
			}

			if (turnAction.type === 'PLAY_CARD') {
				// TODO - continue on invalid?
				yield call(playCardSaga, turnAction, state)
			} else if (turnAction.type === 'CHANGE_ACTIVE_HERMIT') {
				const result = yield call(changeActiveHermitSaga, turnAction, state)
				if (result === 'INVALID') continue
			} else if (turnAction.type === 'APPLY_EFFECT') {
				if (!availableActions.includes('APPLY_EFFECT')) continue
				const result = yield call(applyEffectSaga, turnAction, state)
				if (result === 'INVALID') continue
				pastTurnActions.push('APPLY_EFFECT')
			} else if (turnAction.type === 'ATTACK') {
				const typeAction = ATTACK_TO_ACTION[turnAction.payload.type]
				if (!typeAction || !availableActions.includes(typeAction)) continue
				const result = yield call(attackSaga, turnAction, state)
				if (result === 'INVALID') continue
				pastTurnActions.push('ATTACK')
			} else if (turnAction.type === 'END_TURN') {
				if (!availableActions.includes('END_TURN')) continue
				break
			} else {
				// handle unknown action
			}

			const playersAlive = yield call(checkHermitHealth, gameState)
			if (!playersAlive) break
		}

		// Apply damage from ailments
		for (let row of opponentPlayer.board.rows) {
			if (row.ailments.includes('fire')) row.health -= 20
			if (row.ailments.includes('poison')) row.health -= 20
		}

		// TODO - Inform player if he won
		const playersAlive = yield call(checkHermitHealth, gameState)
		if (!playersAlive) {
			gamePlayerIds.forEach((playerId) => {
				allPlayers[playerId].socket.emit('GAME_END', {
					type: 'GAME_END',
					payload: {
						gameState,
					},
				})
			})
			break
		}

		// Draw a card fropm deck when turn ends
		// TODO - Find out if game should end once pile runs out
		const drawCard = currentPlayer.pile.shift()
		if (drawCard) currentPlayer.hand.push(drawCard)

		// If player has not used his single use card return it to hand
		// otherwise move it to discarded pile
		discardSingleUse(currentPlayer)
	}
}

export default gameSaga
