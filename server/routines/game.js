import {
	all,
	take,
	fork,
	actionChannel,
	call,
	cancel,
	race,
	delay,
} from 'redux-saga/effects'
import {buffers} from 'redux-saga'
import CARDS from '../cards'
import {hasEnoughItems, discardSingleUse, discardCard} from '../utils'
import {getEmptyRow} from '../utils/state-gen'
import {getPickedCardsInfo} from '../utils/picked-cards'
import attackSaga, {ATTACK_TO_ACTION} from './turn-actions/attack'
import playCardSaga from './turn-actions/play-card'
import changeActiveHermitSaga from './turn-actions/change-active-hermit'
import applyEffectSaga from './turn-actions/apply-effect'
import removeEffectSaga from './turn-actions/remove-effect'
import followUpSaga from './turn-actions/follow-up'
import registerCards from '../cards/card-plugins'
import chatSaga from './background/chat'
import connectionStatusSaga from './background/connection-status'
import {CONFIG} from '../../config'

/**
 * @typedef {import("models/game-model").GameModel} GameModel
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 */

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

/**
 * @param {number} seconds
 * @returns {number}
 */
const getTimerForSeconds = (seconds) => {
	const maxTime = CONFIG.limits.maxTurnTime * 1000
	return Date.now() - maxTime + seconds * 1000
}

/**
 * @param {GameModel} game
 * @return {Array<AvailableAction>}
 */
function getAvailableActions(game, pastTurnActions) {
	const {turn} = game.state
	const {currentPlayer, opponentPlayer} = game.ds
	/** @type {Array<AvailableAction>} */
	const actions = []

	if (opponentPlayer.followUp) {
		actions.push('WAIT_FOR_OPPONENT_FOLLOWUP')
		return actions
	}

	if (currentPlayer.followUp) {
		actions.push('FOLLOW_UP')
		return actions
	}

	if (currentPlayer.board.activeRow !== null) {
		actions.push('END_TURN')
	}
	if (
		currentPlayer.board.singleUseCard &&
		!currentPlayer.board.singleUseCardUsed
	) {
		actions.push('APPLY_EFFECT')
		actions.push('REMOVE_EFFECT')
	}

	if (
		pastTurnActions.includes('ATTACK') ||
		pastTurnActions.includes('CHANGE_ACTIVE_HERMIT')
	) {
		// In case you kill yourself with TNT
		if (currentPlayer.board.activeRow === null) {
			actions.push('CHANGE_ACTIVE_HERMIT')
		}
		return actions
	}

	const hermits = currentPlayer.board.rows.filter(
		(row) => row.hermitCard
	).length
	if (
		(hermits === 0 || currentPlayer.board.activeRow !== null) &&
		hermits < 5
	) {
		actions.push('ADD_HERMIT')
	}

	// Player can't change active hermit if he has no other hermits
	const hasOtherHermit = currentPlayer.board.rows.some(
		(row, index) => row.hermitCard && index !== currentPlayer.board.activeRow
	)

	const {activeRow, rows} = currentPlayer.board
	const isSleeping =
		activeRow !== null &&
		rows[activeRow]?.ailments.find((a) => a.id === 'sleeping')

	if (hasOtherHermit && !isSleeping) {
		actions.push('CHANGE_ACTIVE_HERMIT')
	}

	if (activeRow !== null) {
		actions.push('PLAY_EFFECT_CARD')

		if (turn > 1) {
			const hermitId = rows[activeRow].hermitCard?.cardId
			const hermitInfo = hermitId ? CARDS[hermitId] || null : null
			const suId = currentPlayer.board.singleUseCard?.cardId || null
			const suInfo = suId ? CARDS[suId] || null : null
			const itemCards = rows[activeRow].itemCards.filter(Boolean)

			// only add attack options if not sleeping
			if (hermitInfo && !isSleeping) {
				if (!currentPlayer.board.singleUseCardUsed && suInfo?.damage) {
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
	}

	if (!pastTurnActions.includes('PLAY_ITEM_CARD'))
		actions.push('PLAY_ITEM_CARD')
	if (
		!pastTurnActions.includes('PLAY_SINGLE_USE_CARD') &&
		!currentPlayer.board.singleUseCard
	)
		actions.push('PLAY_SINGLE_USE_CARD')

	return actions
}

function playerAction(actionType, playerId) {
	return (action) => action.type === actionType && action.playerId === playerId
}

// return false in case one player is dead
/**
 *
 * @param {GameModel} game
 * @returns {SagaIterator}
 */
function* checkHermitHealth(game) {
	/** @type {Array<PlayerState>} */
	const playerStates = Object.values(game.state.players)
	/** @type {Array<string>} */
	const deadPlayerIds = []
	for (let playerState of playerStates) {
		const playerRows = playerState.board.rows
		const activeRow = playerState.board.activeRow
		for (let rowIndex in playerRows) {
			const row = playerRows[rowIndex]
			if (row.hermitCard && row.health <= 0) {
				// recovery array {amount: number, effectCard?: CardT}
				let result = game.hooks.hermitDeath.call([], {
					playerState,
					row,
				})

				// we want to apply the highest recovery amount
				result.sort((a, b) => b.amount - a.amount)

				if (result[0]) {
					row.health = result[0].amount
					row.ailments = []
					if (result[0].discardEffect) discardCard(game, row.effectCard)
					continue
				}

				if (row.hermitCard) discardCard(game, row.hermitCard)
				if (row.effectCard) discardCard(game, row.effectCard)
				row.itemCards.forEach(
					(itemCard) => itemCard && discardCard(game, itemCard)
				)
				playerRows[rowIndex] = getEmptyRow()
				if (Number(rowIndex) === activeRow) {
					playerState.board.activeRow = null
				}
				playerState.lives -= 1

				// reward cards
				const opponentState = playerStates.find((s) => s.id !== playerState.id)
				if (!opponentState) continue
				const rewardCard = playerState.rewards.shift()
				if (rewardCard) opponentState.hand.push(rewardCard)
			}
		}

		const isDead = playerState.lives <= 0
		const firstPlayerTurn =
			playerState.lives >= 3 &&
			game.state.turn <=
				game.state.order.findIndex((id) => id === playerState.id) + 1

		const noHermitsLeft =
			!firstPlayerTurn && playerState.board.rows.every((row) => !row.hermitCard)
		if (isDead || noHermitsLeft) {
			console.log('Player dead: ', {
				isDead,
				noHermitsLeft,
				turn: game.state.turn,
			})
			deadPlayerIds.push(playerState.id)
		}
	}

	return deadPlayerIds
}

/**
 * @param {GameModel} game
 * @returns {SagaIterator}
 */
function* sendGameState(game, turnState) {
	const {availableActions, opponentAvailableActions, pastTurnActions} =
		turnState
	// TODO - omit state clients shouldn't see (e.g. other players hand, either players pile etc.)
	game.getPlayers().forEach((player) => {
		player.socket.emit('GAME_STATE', {
			type: 'GAME_STATE',
			payload: {
				gameState: game.state,
				opponentId: game.getPlayerIds().find((id) => id !== player.playerId),
				pastTurnActions:
					player.playerId === game.ds.currentPlayer.id ? pastTurnActions : null,
				availableActions:
					player.playerId === game.ds.currentPlayer.id
						? availableActions
						: opponentAvailableActions,
			},
		})
	})
}

/**
 * @param {GameModel} game
 * @param {*} turnAction
 * @param {TurnState} turnState
 * @returns {SagaIterator}
 */
function* turnActionSaga(game, turnAction, turnState) {
	// TODO - avoid having socket in actions
	const {availableActions, opponentAvailableActions, pastTurnActions} =
		turnState
	const pickedCardsInfo = getPickedCardsInfo(game, turnAction)
	/** @type {ActionState} */
	const actionState = {
		...turnState,
		pickedCardsInfo,
	}
	let endTurn = false

	game.hooks.actionStart.call(turnAction, actionState)

	if (turnAction.type === 'PLAY_CARD') {
		// TODO - continue on invalid?
		yield call(playCardSaga, game, turnAction, actionState)
		//
	} else if (turnAction.type === 'CHANGE_ACTIVE_HERMIT') {
		yield call(changeActiveHermitSaga, game, turnAction, actionState)
		//
	} else if (turnAction.type === 'APPLY_EFFECT') {
		if (!availableActions.includes('APPLY_EFFECT')) return
		const result = yield call(applyEffectSaga, game, turnAction, actionState)
		if (result !== 'INVALID') pastTurnActions.push('APPLY_EFFECT')
		//
	} else if (turnAction.type === 'REMOVE_EFFECT') {
		if (!availableActions.includes('REMOVE_EFFECT')) return
		const result = yield call(removeEffectSaga, game, turnAction, actionState)
		if (result !== 'INVALID') pastTurnActions.push('REMOVE_EFFECT')
		//
	} else if (turnAction.type === 'FOLLOW_UP') {
		if (
			!availableActions.includes('FOLLOW_UP') &&
			!opponentAvailableActions.includes('FOLLOW_UP')
		)
			return
		const result = yield call(followUpSaga, game, turnAction, actionState)
		//
	} else if (turnAction.type === 'ATTACK') {
		const typeAction = ATTACK_TO_ACTION[turnAction.payload.type]
		if (!typeAction || !availableActions.includes(typeAction)) return
		const result = yield call(attackSaga, game, turnAction, actionState)
		if (result !== 'INVALID') pastTurnActions.push('ATTACK')
		//
	} else if (turnAction.type === 'END_TURN') {
		if (!availableActions.includes('END_TURN')) return
		endTurn = true
	} else {
		// handle unknown action
	}

	// remove sleep on knock out
	game.ds.opponentPlayer.board.rows.forEach((row, index) => {
		const isSleeping = row.ailments.some((a) => a.id === 'sleeping')
		const isKnockedout = row.ailments.some((a) => a.id === 'knockedout')
		if (isSleeping && isKnockedout) {
			row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')
		}
	})

	game.hooks.actionEnd.call(turnAction, actionState)

	const deadPlayerIds = yield call(checkHermitHealth, game)
	if (deadPlayerIds.length) endTurn = true

	return endTurn ? 'END_TURN' : 'DONE'
}

/**
 * @param {GameModel} game
 * @param {Array<string>} pastTurnActions
 * @returns {SagaIterator}
 */
function* turnActionsSaga(game, pastTurnActions) {
	const {opponentPlayer, opponentPlayerId, currentPlayer, currentPlayerId} =
		game.ds

	const turnActionChannel = yield actionChannel(
		[
			...['FOLLOW_UP'].map((type) => playerAction(type, opponentPlayerId)),
			...[
				'PLAY_CARD',
				'FOLLOW_UP',
				'CHANGE_ACTIVE_HERMIT',
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'ATTACK',
				'END_TURN',
			].map((type) => playerAction(type, currentPlayerId)),
		],
		buffers.dropping(10)
	)

	try {
		while (true) {
			let availableActions = getAvailableActions(game, pastTurnActions)
			availableActions = game.hooks.availableActions.call(
				availableActions,
				pastTurnActions
			)

			/** @type {Array<AvailableAction>} */
			const opponentAvailableActions = opponentPlayer.followUp
				? ['FOLLOW_UP']
				: ['WAIT_FOR_TURN']

			// @TODO could this be in gameState.turnState?
			/** @type {TurnState} */
			const turnState = {
				availableActions,
				opponentAvailableActions,
				pastTurnActions,
			}
			game._turnStateCache = turnState

			game.state.turnTime = game.state.turnTime || Date.now()
			const maxTime = CONFIG.limits.maxTurnTime * 1000
			const remainingTime = game.state.turnTime + maxTime - Date.now()
			const graceTime = 1000
			game.state.turnRemaining = Math.floor((remainingTime + graceTime) / 1000)

			yield call(sendGameState, game, turnState)

			const raceResult = yield race({
				turnAction: take(turnActionChannel),
				timeout: delay(remainingTime + graceTime),
			})

			// Handle timeout
			const hasActiveHermit = currentPlayer.board.activeRow !== null
			const opponentFollowUp = !!opponentPlayer.followUp
			if (raceResult.timeout) {
				if (opponentFollowUp) {
					game.state.turnTime = getTimerForSeconds(20)
					game.hooks.followUpTimeout.call()
					continue
				} else if (!hasActiveHermit) {
					game.endInfo.reason = 'time'
					game.endInfo.deadPlayerIds = [currentPlayer.id]
					return 'GAME_END'
				}
				break
			}

			// Run action logic
			const result = yield call(
				turnActionSaga,
				game,
				raceResult.turnAction,
				turnState
			)

			// set timer to 20s on new followup (for opponent)
			// or succesful followup (for current player)
			if (opponentFollowUp !== !!opponentPlayer.followUp) {
				game.state.turnTime = getTimerForSeconds(20)
			}

			if (result === 'END_TURN') break
		}
	} finally {
		turnActionChannel.close()
	}
}

/**
 * @param {GameModel} game
 * @returns {SagaIterator}
 */
function* turnSaga(game) {
	const pastTurnActions = []

	const {currentPlayerId, currentPlayer, opponentPlayer} = game.ds

	game.state.turnPlayerId = currentPlayerId
	game.state.turnTime = Date.now()
	game.state.turnRemaining = CONFIG.limits.maxTurnTime

	// ailment logic
	for (let row of currentPlayer.board.rows) {
		for (let ailment of row.ailments) {
			// decrease duration
			if (ailment.duration === 0) {
				// time up, get rid of this ailment
				row.ailments = row.ailments.filter((a) => a.id !== ailment.id)
			} else if (ailment.duration > -1) {
				// ailment is not infinite, reduce duration by 1
				ailment.duration--
			}
		}
	}

	/** @type {{skipTurn?: boolean}} */
	const turnConfig = {}
	game.hooks.turnStart.call(turnConfig)

	if (!turnConfig.skipTurn) {
		const result = yield call(turnActionsSaga, game, pastTurnActions)
		if (result === 'GAME_END') return 'GAME_END'
	}

	// Apply damage from ailments
	// TODO - Armor should prevent ailment damage
	for (let row of opponentPlayer.board.rows) {
		if (
			row.health &&
			row.ailments.find((a) => a.id === 'fire' || a.id === 'poison')
		)
			row.health -= 20
	}

	game.hooks.turnEnd.call()

	currentPlayer.coinFlips = {}
	currentPlayer.followUp = null
	opponentPlayer.followUp = null

	const deadPlayerIds = yield call(checkHermitHealth, game)
	if (deadPlayerIds.length) {
		game.endInfo.reason =
			game.state.players[deadPlayerIds[0]].lives <= 0 ? 'lives' : 'hermits'
		game.endInfo.deadPlayerIds = deadPlayerIds
		return 'GAME_END'
	}

	// Draw a card from deck when turn ends
	const drawCard = currentPlayer.pile.shift()
	if (drawCard) {
		currentPlayer.hand.push(drawCard)
	} else {
		console.log('Player dead: ', {
			noCards: true,
			turn: game.state.turn,
		})
		game.endInfo.reason = 'cards'
		game.endInfo.deadPlayerIds = [currentPlayerId]
		return 'GAME_END'
	}

	// If player has not used his single use card return it to hand
	// otherwise move it to discarded pile
	discardSingleUse(game, currentPlayer)
	return 'DONE'
}

/**
 * @param {GameModel} game
 * @returns {SagaIterator}
 */
function* gameSaga(game) {
	try {
		if (!game.state) throw new Error('Trying to start uninitialized game')
		registerCards(game)

		const backgroundTasks = yield all([
			fork(chatSaga, game),
			fork(connectionStatusSaga, game),
		])

		game.hooks.gameStart.call()

		while (true) {
			game.state.turn++
			const result = yield call(turnSaga, game)
			if (result === 'GAME_END') break
		}

		yield cancel(backgroundTasks)
	} finally {
		game.hooks.gameEnd.call()
	}
}

export default gameSaga
