import {all, take, fork, actionChannel, call, cancel, race, delay} from 'redux-saga/effects'
import {buffers} from 'redux-saga'
import CARDS, {HERMIT_CARDS, ITEM_CARDS, SINGLE_USE_CARDS} from '../../common/cards'
import {hasEnoughEnergy, discardSingleUse, discardCard, printHooksState} from '../utils'
import {getEmptyRow, getLocalGameState} from '../utils/state-gen'
import {getPickedSlots} from '../utils/picked-cards'
import attackSaga, {ATTACK_TO_ACTION, runAilmentAttacks} from './turn-actions/attack'
import playCardSaga from './turn-actions/play-card'
import changeActiveHermitSaga from './turn-actions/change-active-hermit'
import applyEffectSaga from './turn-actions/apply-effect'
import removeEffectSaga from './turn-actions/remove-effect'
import registerCards from '../../common/cards/card-plugins'
import chatSaga from './background/chat'
import connectionStatusSaga from './background/connection-status'
import {CONFIG, DEBUG_CONFIG} from '../../config'
import followUpSaga from './turn-actions/follow-up'
import {getCardPos} from '../utils/cards'

/**
 * @typedef {import("common/types/game-state").AvailableActionsT} AvailableActionsT
 * @typedef {import("common/types/cards").CardTypeT} CardTypeT
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 * @typedef {import('common/types/game-state').LocalGameState} LocalGameState
 * @typedef {import('server/models/game-model').GameModel} GameModel'
 */

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
 * @param {Array<import('common/types/cards').EnergyT>} availableEnergy
 * @return {AvailableActionsT}
 */
function getAvailableActions(game, pastTurnActions, availableEnergy) {
	const {turn} = game.state
	const {currentPlayer, opponentPlayer} = game.ds
	/** @type {AvailableActionsT} */
	const actions = []

	/**
	 * @param {CardTypeT} type
	 * @returns {boolean}
	 */
	const hasTypeInHand = (type) => {
		return currentPlayer.hand.some((card) => CARDS[card.cardId].type.includes(type))
	}
	const hasHermitInHand = hasTypeInHand('hermit')
	const hasItemInHand = hasTypeInHand('item')
	const hasEffectInHand = hasTypeInHand('effect')
	const hasSingleUseInHand = hasTypeInHand('single_use')

	if (Object.keys(opponentPlayer.followUp).length > 0) {
		actions.push('WAIT_FOR_OPPONENT_FOLLOWUP')
		return actions
	}

	if (Object.keys(currentPlayer.followUp).length > 0) {
		actions.push('FOLLOW_UP')
		return actions
	}

	if (currentPlayer.board.activeRow !== null) {
		actions.push('END_TURN')
	}
	if (currentPlayer.board.singleUseCard && !currentPlayer.board.singleUseCardUsed) {
		actions.push('APPLY_EFFECT')
		actions.push('REMOVE_EFFECT')
	}

	if (pastTurnActions.includes('ATTACK') || pastTurnActions.includes('CHANGE_ACTIVE_HERMIT')) {
		// In case you kill yourself with TNT
		if (currentPlayer.board.activeRow === null) {
			actions.push('CHANGE_ACTIVE_HERMIT')
		}
		return actions
	}

	const hermits = currentPlayer.board.rows.filter((row) => row.hermitCard).length
	const hasNoHermit = hermits === 0
	const hasActiveHermit = currentPlayer.board.activeRow !== null
	if ((hasNoHermit || hasActiveHermit) && hermits < 5 && hasHermitInHand) {
		actions.push('ADD_HERMIT')
	}

	// Player can't change active hermit if he has no other hermits
	const hasOtherHermit = currentPlayer.board.rows.some(
		(row, index) => row.hermitCard && index !== currentPlayer.board.activeRow
	)

	const {activeRow, rows} = currentPlayer.board
	const isSleeping =
		activeRow !== null && rows[activeRow]?.ailments.find((a) => a.id === 'sleeping')

	if (hasOtherHermit && !isSleeping) {
		actions.push('CHANGE_ACTIVE_HERMIT')
	}

	const isSlow = activeRow !== null && rows[activeRow]?.ailments.find((a) => a.id === 'slowness')

	if (!hasNoHermit && hasEffectInHand) actions.push('PLAY_EFFECT_CARD')

	if (activeRow !== null) {
		if (turn > 1) {
			const hermitId = rows[activeRow]?.hermitCard?.cardId
			const hermitInfo = hermitId ? HERMIT_CARDS[hermitId] || null : null

			// only add attack options if not sleeping
			if (hermitInfo && !isSleeping) {
				let showZeroAttack = true
				if (
					DEBUG_CONFIG.noItemRequirements ||
					hasEnoughEnergy(availableEnergy, hermitInfo.primary.cost)
				) {
					actions.push('PRIMARY_ATTACK')
					showZeroAttack = false
				}
				if (
					!isSlow &&
					(DEBUG_CONFIG.noItemRequirements ||
						hasEnoughEnergy(availableEnergy, hermitInfo.secondary.cost))
				) {
					actions.push('SECONDARY_ATTACK')
					showZeroAttack = false
				}
				if (
					showZeroAttack &&
					!currentPlayer.board.singleUseCardUsed
					//&& suInfo?.damage
				) {
					actions.push('ZERO_ATTACK')
				}
			}
		}
	}

	if (!pastTurnActions.includes('PLAY_ITEM_CARD') && !hasNoHermit && hasItemInHand)
		actions.push('PLAY_ITEM_CARD')

	if (
		!pastTurnActions.includes('PLAY_SINGLE_USE_CARD') &&
		!hasNoHermit &&
		!currentPlayer.board.singleUseCard &&
		hasSingleUseInHand
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
				// Call hermit death hooks
				const hermitPos = getCardPos(game, row.hermitCard.cardInstance)
				if (hermitPos) {
					const hermitDeathHooks = Object.values(playerState.hooks.onHermitDeath)
					for (let i = 0; i < hermitDeathHooks.length; i++) {
						hermitDeathHooks[i](hermitPos)
					}
				}

				if (row.hermitCard) discardCard(game, row.hermitCard)
				if (row.effectCard) discardCard(game, row.effectCard)
				row.itemCards.forEach((itemCard) => itemCard && discardCard(game, itemCard))
				playerRows[rowIndex] = getEmptyRow()
				if (Number(rowIndex) === activeRow) {
					playerState.board.activeRow = null
				}
				playerState.lives -= 1

				// reward cards
				const opponentState = playerStates.find((s) => s.id !== playerState.id)
				if (!opponentState) continue
				const rewardCard = playerState.pile.shift()
				if (rewardCard) opponentState.hand.push(rewardCard)
			}
		}

		const isDead = playerState.lives <= 0
		const firstPlayerTurn =
			playerState.lives >= 3 &&
			game.state.turn <= game.state.order.findIndex((id) => id === playerState.id) + 1

		const noHermitsLeft = !firstPlayerTurn && playerState.board.rows.every((row) => !row.hermitCard)
		if (isDead || noHermitsLeft) {
			//console.log('Player dead: ', {
			//	isDead,
			//	noHermitsLeft,
			//	turn: game.state.turn,
			//})
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
	const {availableActions, opponentAvailableActions, pastTurnActions} = turnState
	game.getPlayers().forEach((player) => {
		const localGameState = getLocalGameState(
			game,
			player,
			availableActions || [],
			pastTurnActions || [],
			opponentAvailableActions || []
		)

		player.socket.emit('GAME_STATE', {
			type: 'GAME_STATE',
			payload: {
				localGameState,
			},
		})
	})
}

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @param {TurnState} turnState
 * @returns {SagaIterator}
 */
function* turnActionSaga(game, turnAction, turnState) {
	// TODO - avoid having socket in actions
	const {availableActions, opponentAvailableActions, pastTurnActions} = turnState

	const pickedSlots = getPickedSlots(game, turnAction)
	// Validation failed
	if (!pickedSlots) return

	let modalResult = null
	if (turnAction.payload && turnAction.payload.modalResult) {
		modalResult = turnAction.payload.modalResult
	}

	/** @type {ActionState} */
	const actionState = {
		...turnState,
		pickedSlots,
		modalResult,
	}
	let endTurn = false

	game.hooks.actionStart.call(turnAction, actionState)

	if (turnAction.type === 'PLAY_CARD') {
		const result = yield call(playCardSaga, game, turnAction, actionState)
		if (result === 'INVALID') pastTurnActions.push('PLAYED_INVALID_CARD')
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
		if (!availableActions.includes('FOLLOW_UP') && !opponentAvailableActions.includes('FOLLOW_UP'))
			return
		yield call(followUpSaga, game, turnAction, actionState)
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
 * @param {AvailableActionsT} pastTurnActions
 * @param {{skipTurn?: boolean}} turnConfig
 * @returns {SagaIterator}
 */
function* turnActionsSaga(game, pastTurnActions, turnConfig) {
	const {opponentPlayer, opponentPlayerId, currentPlayer, currentPlayerId} = game.ds
	let turnRemaining = game.state.timer.turnRemaining

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
			if (DEBUG_CONFIG.showHooksState.enabled) printHooksState(game)

			// Available actions code

			// First, get available energy
			/** @type {Array<import('types/cards').EnergyT>} */
			let availableEnergy = []

			const {playerActiveRow} = game.ds
			if (playerActiveRow) {
				// Get energy from each item card
				for (let i = 0; i < playerActiveRow.itemCards.length; i++) {
					const card = playerActiveRow.itemCards[i]
					if (!card) continue
					const pos = getCardPos(game, card.cardInstance)
					if (!pos) continue
					const itemInfo = ITEM_CARDS[card.cardId]
					if (!itemInfo) continue

					availableEnergy.push(...itemInfo.getEnergy(game, card.cardInstance, pos))
				}

				// Modify available energy
				const energyHooks = Object.values(currentPlayer.hooks.availableEnergy)
				for (let i = 0; i < energyHooks.length; i++) {
					availableEnergy = energyHooks[i](availableEnergy)
				}
			}

			/** @type {AvailableActionsT} */
			let blockedActions = []
			let availableActions = getAvailableActions(game, pastTurnActions, availableEnergy)

			// Get blocked actions
			const blockedHooks = Object.values(currentPlayer.hooks.blockedActions)
			for (let i = 0; i < blockedHooks.length; i++) {
				blockedActions = blockedHooks[i](blockedActions, pastTurnActions, availableEnergy)
			}

			blockedActions.push(...DEBUG_CONFIG.blockedActions)

			// Initial blocking of actions
			availableActions = availableActions.filter((action) => !blockedActions.includes(action))

			// Get available actions, while filtering out blocked actions
			const availableHooks = Object.values(currentPlayer.hooks.availableActions)
			for (let i = 0; i < availableHooks.length; i++) {
				const newActions = availableHooks[i](availableActions, pastTurnActions, availableEnergy)
				availableActions = newActions.filter((action) => !blockedActions.includes(action))
			}

			availableActions.push(...DEBUG_CONFIG.availableActions)

			if (
				DEBUG_CONFIG.autoEndTurn &&
				availableActions.includes('END_TURN') &&
				availableActions.length === 1
			) {
				break
			}
			// End of available actions code

			if (turnConfig.skipTurn) {
				if (currentPlayer.board.activeRow === null) availableActions = ['CHANGE_ACTIVE_HERMIT']
				else return
			}

			/** @type {AvailableActionsT} */
			const opponentAvailableActions =
				Object.keys(opponentPlayer.followUp).length > 0 ? ['FOLLOW_UP'] : ['WAIT_FOR_TURN']

			/** @type {TurnState} */
			const turnState = {
				availableActions,
				opponentAvailableActions,
				pastTurnActions,
			}
			game.turnState = turnState

			game.state.timer.turnTime = game.state.timer.turnTime || Date.now()
			const maxTime = CONFIG.limits.maxTurnTime * 1000
			const remainingTime = game.state.timer.turnTime + maxTime - Date.now()
			const graceTime = 1000
			game.state.timer.turnRemaining = Math.floor((remainingTime + graceTime) / 1000)

			yield call(sendGameState, game, turnState)

			const raceResult = yield race({
				turnAction: take(turnActionChannel),
				timeout: delay(remainingTime + graceTime),
			})

			// Reset coin flips they were already shown
			currentPlayer.coinFlips = []
			opponentPlayer.coinFlips = []

			// Handle timeout
			const hasActiveHermit = currentPlayer.board.activeRow !== null
			const playerFollowUp = Object.keys(currentPlayer.followUp).length > 0
			const opponentFollowUp = Object.keys(opponentPlayer.followUp).length > 0
			const playerWithFollowUp = opponentFollowUp
				? opponentPlayer
				: playerFollowUp
				? currentPlayer
				: null
			if (raceResult.timeout) {
				if (playerWithFollowUp) {
					const followUpTimeoutHooks = Object.values(playerWithFollowUp.hooks.onFollowUpTimeout)
					for (let i = 0; i < followUpTimeoutHooks.length; i++) {
						for (const followUp of Object.keys(playerWithFollowUp.followUp)) {
							followUpTimeoutHooks[i](followUp)
						}
					}

					// Restore the previous time
					game.state.timer.turnTime = getTimerForSeconds(turnRemaining)
					continue
				} else if (!hasActiveHermit) {
					game.endInfo.reason = 'time'
					game.endInfo.deadPlayerIds = [currentPlayer.id]
					return 'GAME_END'
				} else {
					// The timeout is not from a follow up, so end the turn
					break
				}
			}

			// Run action logic
			const result = yield call(turnActionSaga, game, raceResult.turnAction, turnState)

			if (result === 'END_TURN') break

			const playerHasFollowUp = Object.keys(currentPlayer.followUp).length !== 0
			const opponentHasFollowUp = Object.keys(opponentPlayer.followUp).length !== 0
			// If the there's a follow up then set the timer to 20 seconds
			if (playerHasFollowUp || opponentHasFollowUp) {
				turnRemaining = game.state.timer.turnRemaining
				game.state.timer.turnTime = getTimerForSeconds(20)
			}

			// If there was a follow up and it was resolved then set the timer to the previous
			// time otherwise you could use a single use card and the timer would be too short
			// to do anything else.
			if ((!opponentHasFollowUp && opponentFollowUp) || (!playerHasFollowUp && playerFollowUp)) {
				game.state.timer.turnTime = getTimerForSeconds(turnRemaining)
			}
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
	/** @type {AvailableActionsT} */
	const pastTurnActions = []

	const {currentPlayerId, currentPlayer, opponentPlayer} = game.ds

	game.state.turnPlayerId = currentPlayerId
	game.state.timer.turnTime = Date.now()
	game.state.timer.turnRemaining = CONFIG.limits.maxTurnTime

	/** @type {{skipTurn?: boolean}} */
	const turnConfig = {}

	// Call turn start hooks
	const turnStartHooks = Object.values(currentPlayer.hooks.onTurnStart)
	for (let i = 0; i < turnStartHooks.length; i++) {
		turnStartHooks[i]()
	}

	const result = yield call(turnActionsSaga, game, pastTurnActions, turnConfig)
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
	const drawCards = []

	// Call turn end hooks
	const turnEndHooks = Object.values(currentPlayer.hooks.onTurnEnd)
	for (let i = 0; i < turnEndHooks.length; i++) {
		turnEndHooks[i](drawCards)
	}

	currentPlayer.followUp = {}
	opponentPlayer.followUp = {}

	const deadPlayerIds = yield call(checkHermitHealth, game)
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
		drawCards.push(currentPlayer.pile.shift())
	}
	for (let i = 0; i < drawCards.length; i++) {
		const card = drawCards[i]
		if (card) {
			currentPlayer.hand.push(card)
		} else if (!DEBUG_CONFIG.disableDeckOut && !DEBUG_CONFIG.startWithAllCards) {
			game.endInfo.reason = 'cards'
			game.endInfo.deadPlayerIds = [currentPlayerId]
			return 'GAME_END'
		}
	}

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

		const backgroundTasks = yield all([fork(chatSaga, game), fork(connectionStatusSaga, game)])

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
