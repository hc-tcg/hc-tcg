import {take, spawn, actionChannel, call} from 'redux-saga/effects'
import {buffers} from 'redux-saga'
import CARDS from '../cards'
import DAMAGE from '../const/damage'
import {hasEnoughItems, discardSingleUse, discardCard} from '../utils'
import {getGameState, getEmptyRow} from '../utils/state-gen'
import {getDerivedState} from '../utils/derived-state'
import attackSaga, {ATTACK_TO_ACTION} from './turn-actions/attack'
import playCardSaga from './turn-actions/play-card'
import changeActiveHermitSaga from './turn-actions/change-active-hermit'
import applyEffectSaga from './turn-actions/apply-effect'
import followUpSaga from './turn-actions/follow-up'
import {HookMap, SyncHook, SyncBailHook, SyncWaterfallHook} from 'tapable'
import registerCards from '../cards/card-plugins'

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
	const {pastTurnActions, currentPlayer} = derivedState
	const actions = []

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
	}

	// Player can't change active hermit if I he has no other hermits
	const hasOtherHermit = currentPlayer.board.rows.some(
		(row, index) => row.hermitCard && index !== currentPlayer.board.activeRow
	)

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

	// TODO - add more conditions (e.g. you can't change active hermit if there is only one.
	// or you can't add more hermits if all rows are filled)
	actions.push('ADD_HERMIT')

	if (hasOtherHermit) actions.push('CHANGE_ACTIVE_HERMIT')

	const {activeRow, rows} = currentPlayer.board
	if (activeRow !== null) {
		actions.push('PLAY_EFFECT_CARD')

		if (turn > 1) {
			const hermitInfo = CARDS[rows[activeRow].hermitCard.cardId]
			const itemCards = rows[activeRow].itemCards.filter(Boolean)

			if (
				!currentPlayer.board.singleUseCardUsed &&
				DAMAGE[currentPlayer.board.singleUseCard?.cardId]
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
			}
		}

		const isDead = playerState.lives <= 0
		const noHermitsLeft =
			game.state.turn > 2 &&
			playerState.board.rows.every((row) => !row.hermitCard)
		if (isDead || noHermitsLeft) {
			console.log('Player dead: ', {
				isDead,
				noHermitsLeft,
				turn: game.state.turn,
			})
			return false
		}
	}

	return true
}

function* turnActionSaga(game, turnAction, baseDerivedState) {
	// TODO - avoid having socket in actions
	console.log('TURN ACTION: ', turnAction.type)

	const derivedState = getDerivedState(game, turnAction, baseDerivedState)

	const {availableActions, pastTurnActions} = derivedState

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
	} else if (turnAction.type === 'FOLLOW_UP') {
		if (!availableActions.includes('FOLLOW_UP')) return
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

	game.hooks.actionEnd.call(turnAction, derivedState)

	const playersAlive = yield call(checkHermitHealth, game)
	if (!playersAlive) return 'END_TURN'
	return 'DONE'
}

function* turnSaga(allPlayers, gamePlayerIds, game) {
	const pastTurnActions = []

	const currentPlayerId = game.state.order[(game.state.turn + 1) % 2]
	const opponentPlayerId = game.state.order[game.state.turn % 2]
	const currentPlayer = game.state.players[currentPlayerId]
	const opponentPlayer = game.state.players[opponentPlayerId]

	game.state.turnPlayerId = currentPlayer.id

	console.log('NEW TURN: ', {currentPlayerId, opponentPlayerId})

	const derivedState = {
		gameState: game.state,
		currentPlayer,
		opponentPlayer,
		pastTurnActions,
	}

	const turnActionChannel = yield actionChannel(
		[
			'PLAY_CARD',
			'CHANGE_ACTIVE_HERMIT',
			'APPLY_EFFECT',
			'FOLLOW_UP',
			'ATTACK',
			'END_TURN',
		].map((type) => playerAction(type, currentPlayer.id)),
		buffers.dropping(10)
	)

	const turnStart = game.hooks.turnStart.call(derivedState)

	turn_actions_cycle: while (true) {
		if (turnStart === 'SKIP') break

		let availableActions = getAvailableActions(game, derivedState)
		availableActions = game.hooks.availableActions.call(
			availableActions,
			derivedState
		)

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
							: ['WAIT_FOR_TURN'],
				},
			})
		})

		console.log('Waiting for turn action')
		const turnAction = yield take(turnActionChannel)
		const result = yield call(turnActionSaga, game, turnAction, {
			...derivedState,
			availableActions,
		})
		if (result === 'END_TURN') break
	}

	turnActionChannel.close()

	// Apply damage from ailments
	for (let row of opponentPlayer.board.rows) {
		if (row.ailments.includes('fire')) row.health -= 20
		if (row.ailments.includes('poison')) row.health -= 20
	}

	currentPlayer.coinFlips = {}
	// failsafe, should be always null at this point unless it is game over
	currentPlayer.followUp = null

	game.hooks.turnEnd.call(derivedState)

	// TODO - Inform player if he won
	const playersAlive = yield call(checkHermitHealth, game)
	if (!playersAlive) return 'GAME_END'

	// Draw a card from deck when turn ends
	// TODO - End game once pile runs out
	const drawCard = currentPlayer.pile.shift()
	if (drawCard) currentPlayer.hand.push(drawCard)

	// If player has not used his single use card return it to hand
	// otherwise move it to discarded pile
	discardSingleUse(game, currentPlayer)

	return 'DONE'
}

function* gameSaga(allPlayers, gamePlayerIds) {
	// TODO - gameState should be changed only in immutable way so that we can check its history
	const game = {
		state: getGameState(allPlayers, gamePlayerIds),
		hooks: {
			gameStart: new SyncHook([]),
			turnStart: new SyncBailHook(['derived']),
			availableActions: new SyncWaterfallHook(['availableActions', 'derived']),
			actionStart: new SyncHook(['turnAction', 'derived']),
			applyEffect: new SyncBailHook(['turnAction', 'derived']),
			followUp: new SyncBailHook(['turnAction', 'derived']),
			attack: new SyncWaterfallHook(['result', 'turnAction', 'derived']),
			playCard: new HookMap(
				(cardType) => new SyncHook(['turnAction', 'derived'])
			),
			discardCard: new HookMap((cardType) => new SyncBailHook(['card'])),
			changeActiveHermit: new SyncHook(['turnAction', 'derived']),
			actionEnd: new SyncHook(['turnAction', 'derived']),
			hermitDeath: new SyncWaterfallHook(['recovery', 'deathInfo']),
			turnEnd: new SyncHook(['derived']),
			gameEnd: new SyncHook([]),
		},
	}
	registerCards(game)

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
			},
		})
	})

	game.hooks.gameEnd.call()
}

export default gameSaga
