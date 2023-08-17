import {all, take, fork, cancel, race, delay, call, actionChannel} from 'typed-redux-saga'
import {CARDS, HERMIT_CARDS, ITEM_CARDS, SINGLE_USE_CARDS} from 'common/cards'
import {getEmptyRow, getLocalGameState} from '../utils/state-gen'
import {getPickedSlots} from '../utils/picked-cards'
import attackSaga, {runAilmentAttacks, runAllAttacks} from './turn-actions/attack'
import playCardSaga from './turn-actions/play-card'
import changeActiveHermitSaga from './turn-actions/change-active-hermit'
import applyEffectSaga from './turn-actions/apply-effect'
import removeEffectSaga from './turn-actions/remove-effect'
import chatSaga from './background/chat'
import connectionStatusSaga from './background/connection-status'
import {CONFIG, DEBUG_CONFIG} from 'common/config'
import pickCardSaga from './turn-actions/pick-card'
import customModalSaga from './turn-actions/custom-modal'
import {TurnActions, CardT, PlayerState, ActionResult, TurnAction} from 'common/types/game-state'
import {GameModel} from 'common/models/game-model'
import {EnergyT} from 'common/types/cards'
import {hasEnoughEnergy} from 'common/utils/attacks'
import {discardCard, discardSingleUse} from 'common/utils/movement'
import {getCardPos} from 'common/models/card-pos-model'
import {printHooksState} from '../utils'
import {buffers} from 'redux-saga'
import {PickCardActionData} from 'common/types/action-data'
import {AttackModel} from 'common/models/attack-model'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

export const getTimerForSeconds = (seconds: number): number => {
	const maxTime = CONFIG.limits.maxTurnTime * 1000
	return Date.now() - maxTime + seconds * 1000
}

function getAvailableEnergy(game: GameModel) {
	const {currentPlayer, activeRow} = game

	let availableEnergy: Array<EnergyT> = []

	if (activeRow) {
		// Get energy from each item card
		for (let i = 0; i < activeRow.itemCards.length; i++) {
			const card = activeRow.itemCards[i]
			if (!card) continue
			const pos = getCardPos(game, card.cardInstance)
			if (!pos) continue
			const itemInfo = ITEM_CARDS[card.cardId]
			if (!itemInfo) continue

			availableEnergy.push(...itemInfo.getEnergy(game, card.cardInstance, pos))
		}

		// Modify available energy
		availableEnergy = currentPlayer.hooks.availableEnergy.call(availableEnergy)
	}

	return availableEnergy
}

function getAvailableActions(game: GameModel, availableEnergy: Array<EnergyT>): TurnActions {
	const {turn: turnState} = game.state
	const {currentPlayer, opponentPlayer} = game
	const actions: TurnActions = []

	// Custom modal
	if (currentPlayer.modalRequest) {
		return ['CUSTOM_MODAL']
	}

	// Pick requests
	let pickRequestActive = false

	// Check current player first
	if (currentPlayer.pickRequests.length > 0) {
		pickRequestActive = true

		actions.push('PICK_CARD')
	}

	// Check opponent player only if current player has no requests
	if (!pickRequestActive && opponentPlayer.pickRequests.length > 0) {
		// If we are waiting for opponent only ever allow waiting

		game.state.timer.turnTime = Date.now()
		game.state.timer.turnRemaining = CONFIG.limits.extraActionTime
		return ['WAIT_FOR_OPPONENT_PICK']
	}

	const {activeRow, rows, singleUseCard: su, singleUseCardUsed: suUsed} = currentPlayer.board
	const hasOtherHermit = rows.some((row, index) => {
		return !!row.hermitCard && index !== activeRow
	})

	// Actions that require us to have an active row
	if (activeRow !== null) {
		const isSleeping = rows[activeRow]?.ailments.find((a) => a.id === 'sleeping')

		// Change active hermit
		if (hasOtherHermit && !isSleeping && !pickRequestActive) {
			actions.push('CHANGE_ACTIVE_HERMIT')
		}

		// Su actions
		if (su && !suUsed) {
			actions.push('REMOVE_EFFECT')
			if (!pickRequestActive) {
				actions.push('APPLY_EFFECT')
			}
		}

		// Attack actions
		if (activeRow !== null && turnState.turnNumber > 1 && !pickRequestActive) {
			const hermitId = rows[activeRow]?.hermitCard?.cardId
			const hermitInfo = hermitId ? HERMIT_CARDS[hermitId] : null

			// only add attack options if not sleeping
			if (hermitInfo && !isSleeping) {
				if (hasEnoughEnergy(availableEnergy, hermitInfo.primary.cost)) {
					actions.push('PRIMARY_ATTACK')
				}
				if (hasEnoughEnergy(availableEnergy, hermitInfo.secondary.cost)) {
					actions.push('SECONDARY_ATTACK')
				}
				if (su && !suUsed) {
					const suInfo = SINGLE_USE_CARDS[su.cardId]
					if (suInfo && suInfo.canAttack()) {
						actions.push('SINGLE_USE_ATTACK')
					}
				}
			}
		}

		// End turn action
		if (!pickRequestActive) {
			actions.push('END_TURN')
		}
	}

	// Play card actions require an active row unless it's the players first turn
	if (activeRow !== null || (turnState.turnNumber <= 2 && !pickRequestActive)) {
		const handCards = currentPlayer.hand.map((card) => CARDS[card.cardId])
		const allDesiredActions: TurnActions = []
		for (let x = 0; x < handCards.length; x++) {
			const card = handCards[x]
			const desiredActions: TurnActions = card.getActions(game)
			for (let i = 0; i < desiredActions.length; i++) {
				const desiredAction = desiredActions[i]
				if (!allDesiredActions.includes(desiredAction)) {
					allDesiredActions.push(desiredAction)
				}
			}
		}
		actions.push(...allDesiredActions)
	}

	// Filter out actions that have already been completed - once an action is completed it cannot be used again for the turn
	// Also filter out blocked actions
	let filteredActions = actions.filter((action) => {
		return (
			!turnState.completedActions.includes(action) && !turnState.blockedActions.includes(action)
		)
	})

	// Force add change active hermit if the active row is null and we are not running a pick request
	if (activeRow === null && hasOtherHermit && !pickRequestActive) {
		filteredActions.push('CHANGE_ACTIVE_HERMIT')
	}

	return filteredActions
}

function getBlockedActions(game: GameModel): TurnActions {
	const {currentPlayer} = game

	const actions: TurnActions = []

	const {activeRow, rows} = currentPlayer.board

	const isSlow = activeRow !== null && rows[activeRow]?.ailments.find((a) => a.id === 'slowness')

	// @TODO slowness ailment can just turn into blocked action

	if (isSlow) {
		actions.push('SECONDARY_ATTACK')
	}

	return actions
}

function playerAction(actionType: string, playerId: string) {
	return (action: any) => action.type === actionType && action.playerId === playerId
}

// return false in case one player is dead
function* checkHermitHealth(game: GameModel) {
	const playerStates: Array<PlayerState> = Object.values(game.state.players)
	const deadPlayerIds: Array<string> = []
	for (let playerState of playerStates) {
		const playerRows = playerState.board.rows
		const activeRow = playerState.board.activeRow
		for (let rowIndex in playerRows) {
			const row = playerRows[rowIndex]
			if (row.hermitCard && row.health <= 0) {
				// Call hermit death hooks
				const hermitPos = getCardPos(game, row.hermitCard.cardInstance)
				if (hermitPos) {
					playerState.hooks.onHermitDeath.call(hermitPos)
				}

				if (row.hermitCard) discardCard(game, row.hermitCard)
				if (row.effectCard) discardCard(game, row.effectCard)
				row.itemCards.forEach((itemCard) => itemCard && discardCard(game, itemCard))
				playerRows[rowIndex] = getEmptyRow()
				if (Number(rowIndex) === activeRow) {
					playerState.board.activeRow = null
				}
				playerState.lives -= 1

				// reward card
				const opponentState = playerStates.find((s) => s.id !== playerState.id)
				if (!opponentState) continue
				const rewardCard = playerState.pile.shift()
				if (rewardCard) opponentState.hand.push(rewardCard)
			}
		}

		const isDead = playerState.lives <= 0
		const firstPlayerTurn =
			playerState.lives >= 3 &&
			game.state.turn.turnNumber <= game.getPlayerIds().findIndex((id) => id === playerState.id) + 1

		const noHermitsLeft = !firstPlayerTurn && playerState.board.rows.every((row) => !row.hermitCard)
		if (isDead || noHermitsLeft) {
			deadPlayerIds.push(playerState.id)
		}
	}

	return deadPlayerIds
}

function* sendGameState(game: GameModel) {
	game.getPlayers().forEach((player) => {
		const localGameState = getLocalGameState(game, player)

		player.socket.emit('GAME_STATE', {
			type: 'GAME_STATE',
			payload: {
				localGameState,
			},
		})
	})
}

function* turnActionSaga(game: GameModel, turnAction: any) {
	const {currentPlayerId} = game
	const actionType = turnAction.type as TurnAction

	const availableActions =
		turnAction.playerId === currentPlayerId
			? game.state.turn.availableActions
			: game.state.turn.opponentAvailableActions

	if (!availableActions.includes(actionType)) {
		game.setLastActionResult(actionType, 'FAILURE_ACTION_NOT_AVAILABLE')
		return
	}

	const pickedSlots = getPickedSlots(game, turnAction)
	// Validation failed
	if (!pickedSlots) {
		game.setLastActionResult(actionType, 'FAILURE_INVALID_DATA')
		return
	}

	let modalResult = null
	if (turnAction.payload && turnAction.payload.modalResult) {
		modalResult = turnAction.payload.modalResult
	}

	let endTurn = false

	let result: ActionResult = 'FAILURE_UNKNOWN_ERROR'
	switch (actionType) {
		case 'PLAY_HERMIT_CARD':
		case 'PLAY_ITEM_CARD':
		case 'PLAY_EFFECT_CARD':
		case 'PLAY_SINGLE_USE_CARD':
			result = yield* call(playCardSaga, game, turnAction)
			break

		case 'SINGLE_USE_ATTACK':
		case 'PRIMARY_ATTACK':
		case 'SECONDARY_ATTACK':
			result = yield* call(attackSaga, game, turnAction, pickedSlots)
			break
		case 'CHANGE_ACTIVE_HERMIT':
			result = yield* call(changeActiveHermitSaga, game, turnAction, pickedSlots, modalResult)
			break
		case 'APPLY_EFFECT':
			result = yield* call(applyEffectSaga, game, pickedSlots, modalResult)
			break
		case 'REMOVE_EFFECT':
			result = yield* call(removeEffectSaga, game)
			break
		case 'PICK_CARD':
			result = yield* call(
				pickCardSaga,
				game,
				(turnAction as PickCardActionData)?.payload?.pickResult
			)
			break
		case 'CUSTOM_MODAL':
			result = yield* call(customModalSaga, game, turnAction?.payload?.modalResult)
			break
		case 'END_TURN':
			endTurn = true
			break
		default:
			// Unknown action type, ignore it completely
			game.setLastActionResult(actionType, 'FAILURE_ACTION_NOT_AVAILABLE')
			return
	}

	// Set action result to be sent back to client
	game.setLastActionResult(actionType, result)

	// remove sleep on knock out
	game.opponentPlayer.board.rows.forEach((row, index) => {
		const isSleeping = row.ailments.some((a) => a.id === 'sleeping')
		const isKnockedout = row.ailments.some((a) => a.id === 'knockedout')
		if (isSleeping && isKnockedout) {
			row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')
		}
	})

	const deadPlayerIds = yield* call(checkHermitHealth, game)
	if (deadPlayerIds.length) endTurn = true

	return endTurn ? 'END_TURN' : undefined
}

function* turnActionsSaga(game: GameModel, turnConfig: {skipTurn?: boolean}) {
	const {opponentPlayer, opponentPlayerId, currentPlayer, currentPlayerId} = game

	const turnActionChannel = yield* actionChannel(
		[
			...['PICK_CARD'].map((type) => playerAction(type, opponentPlayerId)),
			...[
				'PLAY_HERMIT_CARD',
				'PLAY_ITEM_CARD',
				'PLAY_EFFECT_CARD',
				'PLAY_SINGLE_USE_CARD',
				'PICK_CARD',
				'CUSTOM_MODAL',
				'CHANGE_ACTIVE_HERMIT',
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'SINGLE_USE_ATTACK',
				'PRIMARY_ATTACK',
				'SECONDARY_ATTACK',
				'END_TURN',
			].map((type) => playerAction(type, currentPlayerId)),
		],
		buffers.dropping(10)
	)

	try {
		while (true) {
			if (DEBUG_CONFIG.showHooksState.enabled) printHooksState(game)

			// Available actions code
			const availableEnergy = getAvailableEnergy(game)
			let blockedActions = getBlockedActions(game)
			let availableActions = getAvailableActions(game, availableEnergy)

			// Get blocked actions from hooks
			// @TODO this should also not really be a hook anymore
			currentPlayer.hooks.blockedActions.call(blockedActions)

			blockedActions.push(...DEBUG_CONFIG.blockedActions)

			// Block SINGLE_USE_ATTACK if PRIMARY_ATTACK or SECONDARY_ATTACK aren't blocked
			if (
				(availableActions.includes('PRIMARY_ATTACK') ||
					availableActions.includes('SECONDARY_ATTACK')) &&
				(!blockedActions.includes('PRIMARY_ATTACK') || !blockedActions.includes('SECONDARY_ATTACK'))
			) {
				blockedActions.push('SINGLE_USE_ATTACK')
			}

			// Remove blocked actions from the availableActions
			availableActions = availableActions.filter((action) => !blockedActions.includes(action))

			availableActions.push(...DEBUG_CONFIG.availableActions)

			game.state.turn.opponentAvailableActions =
				opponentPlayer.pickRequests.length > 0 ? ['PICK_CARD'] : ['WAIT_FOR_TURN']
			game.state.turn.availableActions = availableActions

			if (
				DEBUG_CONFIG.autoEndTurn &&
				availableActions.includes('END_TURN') &&
				availableActions.length === 1
			) {
				break
			}

			if (turnConfig.skipTurn) {
				if (currentPlayer.board.activeRow === null) availableActions = ['CHANGE_ACTIVE_HERMIT']
				else return
			}

			game.state.turn.availableActions = availableActions

			// End of available actions code

			// Timer calculation
			game.state.timer.turnTime = game.state.timer.turnTime || Date.now()
			let maxTime = CONFIG.limits.maxTurnTime * 1000
			if (availableActions.includes('WAIT_FOR_OPPONENT_PICK')) {
				game.state.timer.turnTime = Date.now()
				maxTime = CONFIG.limits.extraActionTime * 1000
			}
			const remainingTime = game.state.timer.turnTime + maxTime - Date.now()
			const graceTime = 1000
			game.state.timer.turnRemaining = Math.floor((remainingTime + graceTime) / 1000)

			yield* call(sendGameState, game)

			const raceResult = yield* race({
				turnAction: take(turnActionChannel),
				timeout: delay(remainingTime + graceTime),
			}) as any // @NOTE - need to type as any due to typed-redux-saga inferring the wrong return type for action channel

			// Reset coin flips
			currentPlayer.coinFlips = []
			opponentPlayer.coinFlips = []

			// Handle timeout
			if (raceResult.timeout) {
				// First check to see if the opponent had a pick request active
				if (opponentPlayer.pickRequests[0]) {
					// If yes, timout that pick request and remove it
					opponentPlayer.pickRequests.shift()?.onTimeout()
					// Reset timer to max time
					game.state.timer.turnTime = Date.now()
					game.state.timer.turnRemaining = CONFIG.limits.maxTurnTime
					continue
				}

				const hasActiveHermit = currentPlayer.board.activeRow !== null
				if (!hasActiveHermit) {
					game.endInfo.reason = 'time'
					game.endInfo.deadPlayerIds = [currentPlayer.id]
					return 'GAME_END'
				} else {
					const newAttacks: Array<AttackModel> = []
					for (const player of [currentPlayer, opponentPlayer]) {
						player.hooks.onTurnTimeout.call(newAttacks)
					}
					if (newAttacks.length > 0) {
						runAllAttacks(game, newAttacks)
					}
					break
				}
			}

			// Run action logic
			const result = yield* call(turnActionSaga, game, raceResult.turnAction)

			if (result === 'END_TURN') break
		}
	} finally {
		turnActionChannel.close()
	}
}

function* turnSaga(game: GameModel) {
	const {currentPlayerId, currentPlayer, opponentPlayer} = game

	// Reset turn state
	game.state.turn.availableActions = []
	game.state.turn.currentPlayerId = currentPlayerId
	game.state.turn.completedActions = []
	game.state.turn.blockedActions = []

	game.state.timer.turnTime = Date.now()
	game.state.timer.turnRemaining = CONFIG.limits.maxTurnTime

	const turnConfig: {skipTurn?: boolean} = {}

	// Call turn start hooks
	currentPlayer.hooks.onTurnStart.call()

	const result = yield* call(turnActionsSaga, game, turnConfig)
	if (result === 'GAME_END') return 'GAME_END'

	// Run the ailment attacks just before turn end
	runAilmentAttacks(game, opponentPlayer)

	// ailment logic

	// row ailments
	for (let row of currentPlayer.board.rows) {
		for (let ailment of row.ailments) {
			// decrease duration
			if (ailment.duration) {
				// ailment is not infinite, reduce duration by 1
				ailment.duration--
			}
		}

		// Get rid of ailments that have expired
		row.ailments = row.ailments.filter((a) => a.duration === undefined || a.duration > 0)
	}

	// Create card draw array
	const drawCards: Array<CardT | null> = []

	// Call turn end hooks
	currentPlayer.hooks.onTurnEnd.call(drawCards)

	// Timeout and clear pick requests
	const allPickRequests = [...currentPlayer.pickRequests, ...opponentPlayer.pickRequests]
	for (let i = 0; i < allPickRequests.length; i++) {
		allPickRequests[i].onTimeout()
	}
	currentPlayer.pickRequests = []
	opponentPlayer.pickRequests = []

	// Timeout and clear modal requests
	// @TODO again modal requests don't handle opponents now
	if (currentPlayer.modalRequest) {
		currentPlayer.modalRequest.onTimeout()
		currentPlayer.modalRequest = null
	}
	opponentPlayer.modalRequest = null

	const deadPlayerIds = yield* call(checkHermitHealth, game)
	if (deadPlayerIds.length) {
		game.endInfo.reason = game.state.players[deadPlayerIds[0]].lives <= 0 ? 'lives' : 'hermits'
		game.endInfo.deadPlayerIds = deadPlayerIds
		return 'GAME_END'
	}

	// If player has not used his single use card return it to hand
	// otherwise move it to discarded pile
	discardSingleUse(game, currentPlayer)

	// Draw a card from deck when turn ends
	if (drawCards.length === 0) {
		const card = currentPlayer.pile.shift()
		drawCards.push(card || null)
	}

	for (let i = 0; i < drawCards.length; i++) {
		const card = drawCards[i]
		if (card) {
			currentPlayer.hand.push(card)
		} else if (
			!DEBUG_CONFIG.disableDeckOut &&
			!DEBUG_CONFIG.startWithAllCards &&
			!DEBUG_CONFIG.unlimitedCards
		) {
			game.endInfo.reason = 'cards'
			game.endInfo.deadPlayerIds = [currentPlayerId]
			return 'GAME_END'
		}
	}

	return 'DONE'
}

function* backgroundTasksSaga(game: GameModel) {
	yield* all([fork(chatSaga, game), fork(connectionStatusSaga, game)])
}

function* gameSaga(game: GameModel) {
	const backgroundTasks = yield* fork(backgroundTasksSaga, game)

	while (true) {
		game.state.turn.turnNumber++
		const result = yield* call(turnSaga, game)
		if (result === 'GAME_END') break
	}

	yield* cancel(backgroundTasks)
}

export default gameSaga
