import {
	take,
	takeEvery,
	fork,
	spawn,
	actionChannel,
	call,
	delay,
	cancel,
} from 'redux-saga/effects'
import {buffers} from 'redux-saga'
import CARDS from '../cards'
import {hasEnoughItems, discardSingleUse, discardCard} from '../utils'
import {getGameState, getEmptyRow} from '../utils/state-gen'
import {getDerivedState} from '../utils/derived-state'
import attackSaga, {ATTACK_TO_ACTION} from './turn-actions/attack'
import playCardSaga from './turn-actions/play-card'
import changeActiveHermitSaga from './turn-actions/change-active-hermit'
import applyEffectSaga from './turn-actions/apply-effect'
import removeEffectSaga from './turn-actions/remove-effect'
import followUpSaga from './turn-actions/follow-up'
import {HookMap, SyncHook, SyncBailHook, SyncWaterfallHook} from 'tapable'
import registerCards from '../cards/card-plugins'
import chatSaga from './chat'

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

function getAvailableActions(game, derivedState) {
	const {turn} = game.state
	const {pastTurnActions, currentPlayer, opponentPlayer} = derivedState
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
	const isSleeping = rows[activeRow]?.ailments.find((a) => a.id === 'sleeping')

	if (hasOtherHermit && !isSleeping) {
		actions.push('CHANGE_ACTIVE_HERMIT')
	}

	if (activeRow !== null) {
		actions.push('PLAY_EFFECT_CARD')

		if (turn > 1) {
			const hermitInfo = CARDS[rows[activeRow].hermitCard.cardId]
			const suInfo = CARDS[currentPlayer.board.singleUseCard?.cardId] || null
			const itemCards = rows[activeRow].itemCards.filter(Boolean)

			// only add attack options if not sleeping
			if (!isSleeping) {
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
function* checkHermitHealth(game) {
	const playerStates = Object.values(game.state.players)
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
			return playerState.id
		}
	}

	return false
}

function* turnActionSaga(game, turnAction, baseDerivedState) {
	// TODO - avoid having socket in actions
	// console.log('TURN ACTION: ', turnAction.type)

	const derivedState = getDerivedState(game, turnAction, baseDerivedState)

	const {availableActions, opponentAvailableActions, pastTurnActions} =
		derivedState

	game.hooks.actionStart.call(turnAction, derivedState)

	if (turnAction.type === 'PLAY_CARD') {
		// TODO - continue on invalid?
		yield call(playCardSaga, game, turnAction, derivedState)
		//
	} else if (turnAction.type === 'CHANGE_ACTIVE_HERMIT') {
		yield call(changeActiveHermitSaga, game, turnAction, derivedState)
		//
	} else if (turnAction.type === 'APPLY_EFFECT') {
		if (!availableActions.includes('APPLY_EFFECT')) return
		const result = yield call(applyEffectSaga, game, turnAction, derivedState)
		if (result !== 'INVALID') pastTurnActions.push('APPLY_EFFECT')
		//
	} else if (turnAction.type === 'REMOVE_EFFECT') {
		if (!availableActions.includes('REMOVE_EFFECT')) return
		const result = yield call(removeEffectSaga, game, turnAction, derivedState)
		if (result !== 'INVALID') pastTurnActions.push('REMOVE_EFFECT')
		//
	} else if (turnAction.type === 'FOLLOW_UP') {
		if (
			!availableActions.includes('FOLLOW_UP') &&
			!opponentAvailableActions.includes('FOLLOW_UP')
		)
			return
		const result = yield call(followUpSaga, game, turnAction, derivedState)
		//
	} else if (turnAction.type === 'ATTACK') {
		const typeAction = ATTACK_TO_ACTION[turnAction.payload.type]
		if (!typeAction || !availableActions.includes(typeAction)) return
		const result = yield call(attackSaga, game, turnAction, derivedState)
		if (result !== 'INVALID') pastTurnActions.push('ATTACK')
		//
	} else if (turnAction.type === 'END_TURN') {
		if (!availableActions.includes('END_TURN')) return
		return 'END_TURN'
	} else {
		// handle unknown action
	}

	// remove sleep on knock out
	baseDerivedState.opponentPlayer.board.rows.forEach((row, index) => {
		const isSleeping = row.ailments.some((a) => a.id === 'sleeping')
		const isKnockedout = row.ailments.some((a) => a.id === 'knockedout')
		if (isSleeping && isKnockedout) {
			row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')
		}
	})

	game.hooks.actionEnd.call(turnAction, derivedState)

	const deadPlayerId = yield call(checkHermitHealth, game)
	if (deadPlayerId) return 'END_TURN'
	return 'DONE'
}

function* sendGameState(allPlayers, gamePlayerIds, game, derivedState) {
	const {currentPlayer, availableActions, opponentAvailableActions} =
		derivedState
	// TODO - omit state clients shouldn't see (e.g. other players hand, either players pile etc.)
	gamePlayerIds.forEach((playerId) => {
		allPlayers[playerId].socket.emit('GAME_STATE', {
			type: 'GAME_STATE',
			payload: {
				gameState: game.state,
				opponentId: gamePlayerIds.find((id) => id !== playerId),
				availableActions:
					playerId === currentPlayer.id
						? availableActions
						: opponentAvailableActions,
			},
		})
	})
}

function* turnSaga(allPlayers, gamePlayerIds, game) {
	const pastTurnActions = []

	const currentPlayerId = game.state.order[(game.state.turn + 1) % 2]
	const opponentPlayerId = game.state.order[game.state.turn % 2]
	const currentPlayer = game.state.players[currentPlayerId]
	const opponentPlayer = game.state.players[opponentPlayerId]

	game.state.turnPlayerId = currentPlayer.id

	// console.log('NEW TURN: ', {currentPlayerId, opponentPlayerId})

	const derivedState = {
		gameState: game.state,
		currentPlayer,
		opponentPlayer,
		pastTurnActions,
	}

	const turnActionChannel = yield actionChannel(
		[
			...['FOLLOW_UP'].map((type) => playerAction(type, opponentPlayer.id)),
			...[
				'PLAY_CARD',
				'FOLLOW_UP',
				'CHANGE_ACTIVE_HERMIT',
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'ATTACK',
				'END_TURN',
			].map((type) => playerAction(type, currentPlayer.id)),
		],
		buffers.dropping(10)
	)

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

	// ----------------
	// start of a turn
	// ----------------
	const turnStart = game.hooks.turnStart.call(derivedState)

	while (true) {
		if (turnStart === 'SKIP') break

		let availableActions = getAvailableActions(game, derivedState)
		availableActions = game.hooks.availableActions.call(
			availableActions,
			derivedState
		)

		const opponentAvailableActions = opponentPlayer.followUp
			? ['FOLLOW_UP']
			: ['WAIT_FOR_TURN']

		const turnDerivedState = {
			...derivedState,
			availableActions,
			opponentAvailableActions,
		}
		game._derivedStateCache = turnDerivedState
		yield call(sendGameState, allPlayers, gamePlayerIds, game, turnDerivedState)

		// console.log('Waiting for turn action')
		const turnAction = yield take(turnActionChannel)
		const result = yield call(
			turnActionSaga,
			game,
			turnAction,
			turnDerivedState
		)
		if (result === 'END_TURN') break
	}

	turnActionChannel.close()

	// ----------------
	// end of a turn
	// ----------------

	// Apply damage from ailments
	// TODO - https://www.youtube.com/watch?v=8iO7KGDxCks 1:21:00 - it seems ailment damage should be part of the toal attakc damage (and thus affected by special effects)
	for (let row of opponentPlayer.board.rows) {
		if (row.ailments.find((a) => a.id === 'fire' || a.id === 'poison'))
			row.health -= 20
	}

	currentPlayer.coinFlips = {}
	// failsafe, should be always null at this point unless it is game over
	currentPlayer.followUp = null

	game.hooks.turnEnd.call(derivedState)

	const deadPlayerId = yield call(checkHermitHealth, game)
	if (deadPlayerId) {
		game.deadPlayerId = deadPlayerId
		return 'GAME_END'
	}

	// Draw a card from deck when turn ends
	// TODO - End game once pile runs out
	const drawCard = currentPlayer.pile.shift()
	if (drawCard) currentPlayer.hand.push(drawCard)

	// If player has not used his single use card return it to hand
	// otherwise move it to discarded pile
	discardSingleUse(game, currentPlayer)

	return 'DONE'
}

function* sendGameStateOnReconnect(allPlayers, gamePlayerIds, game) {
	yield takeEvery(
		(action) =>
			action.type === 'PLAYER_RECONNECTED' &&
			gamePlayerIds.includes(action.payload.playerId),
		function* (action) {
			const {playerId} = action.payload
			const playerSocket = allPlayers[playerId]?.socket
			if (playerSocket && playerSocket.connected) {
				yield delay(1000)
				if (!game._derivedStateCache) return
				const {currentPlayer, availableActions, opponentAvailableActions} =
					game._derivedStateCache
				const payload = {
					gameState: game.state,
					opponentId: gamePlayerIds.find((id) => id !== playerId),
					availableActions:
						playerId === currentPlayer.id
							? availableActions
							: opponentAvailableActions,
				}
				playerSocket.emit('GAME_STATE', {
					type: 'GAME_STATE',
					payload,
				})
			}
		}
	)
}

function* gameSaga(allPlayers, gamePlayerIds) {
	// TODO - gameState should be changed only in immutable way so that we can check its history (probs too big to change rn)
	const game = {
		state: getGameState(allPlayers, gamePlayerIds),
		hooks: {
			gameStart: new SyncHook([]),
			turnStart: new SyncBailHook(['derived']),
			availableActions: new SyncWaterfallHook(['availableActions', 'derived']),
			actionStart: new SyncHook(['turnAction', 'derived']),
			applyEffect: new SyncBailHook(['turnAction', 'derived']),
			removeEffect: new SyncHook(['turnAction', 'derived']),
			followUp: new SyncBailHook(['turnAction', 'derived']),
			attack: new SyncWaterfallHook(['result', 'turnAction', 'derived']),
			playCard: new HookMap(
				(cardType) => new SyncBailHook(['turnAction', 'derived'])
			),
			discardCard: new HookMap((cardType) => new SyncBailHook(['card'])),
			changeActiveHermit: new SyncHook(['turnAction', 'derived']),
			actionEnd: new SyncHook(['turnAction', 'derived']),
			hermitDeath: new SyncWaterfallHook(['recovery', 'deathInfo']),
			turnEnd: new SyncHook(['derived']),
			gameEnd: new SyncHook([]),
		},
		chat: [],
	}

	registerCards(game)

	yield fork(sendGameStateOnReconnect, allPlayers, gamePlayerIds, game)
	yield fork(chatSaga, allPlayers, gamePlayerIds, game)

	game.hooks.gameStart.call()

	turn_cycle: while (true) {
		game.state.turn++
		const result = yield call(turnSaga, allPlayers, gamePlayerIds, game)
		if (result === 'GAME_END') break
	}

	gamePlayerIds.forEach((playerId) => {
		allPlayers[playerId].socket.emit('GAME_END', {
			type: 'GAME_END',
			payload: {
				gameState: game.state,
				reason: game.deadPlayerId === playerId ? 'you_lost' : 'you_won',
			},
		})
	})

	game.hooks.gameEnd.call()

	yield cancel()
}

export default gameSaga
