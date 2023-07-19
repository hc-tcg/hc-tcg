import {all, take, fork, actionChannel, call, cancel, race, delay} from 'redux-saga/effects'
import {Saga, SagaIterator, buffers} from 'redux-saga'
import CARDS, {HERMIT_CARDS, ITEM_CARDS, SINGLE_USE_CARDS} from '../../common/cards'
import {hasEnoughEnergy, discardSingleUse, discardCard, printHooksState} from '../utils'
import {getEmptyRow, getLocalGameState} from '../utils/state-gen'
import {getPickedSlots} from '../utils/picked-cards'
import attackSaga, {ATTACK_TO_ACTION, runAilmentAttacks, runAllAttacks} from './turn-actions/attack'
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
import {AvailableActionsT, CardT, PlayerState} from '../../common/types/game-state'
import {GameModel} from '../models/game-model'
import {CardTypeT, EnergyT} from '../../common/types/cards'
import {AttackModel} from '../models/attack-model'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

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
const getTimerForSeconds = (seconds: number): number => {
	const maxTime = CONFIG.limits.maxTurnTime * 1000
	return Date.now() - maxTime + seconds * 1000
}

function getAvailableActions(
	game: GameModel,
	pastTurnActions: Array<string>,
	availableEnergy: Array<EnergyT>
): AvailableActionsT {
	const {turn} = game.state
	const {currentPlayer, opponentPlayer} = game
	/** @type {AvailableActionsT} */
	const actions: AvailableActionsT = []

	/**
	 * @param {CardTypeT} type
	 * @returns {boolean}
	 */
	const hasTypeInHand = (type: CardTypeT): boolean => {
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

	if (activeRow !== null) {
		if (turn > 1) {
			const hermitId = rows[activeRow]?.hermitCard?.cardId
			const hermitInfo = hermitId ? HERMIT_CARDS[hermitId] || null : null

			// only add attack options if not sleeping
			if (hermitInfo && !isSleeping) {
				if (
					DEBUG_CONFIG.noItemRequirements ||
					hasEnoughEnergy(availableEnergy, hermitInfo.primary.cost)
				) {
					actions.push('PRIMARY_ATTACK')
				}
				if (
					DEBUG_CONFIG.noItemRequirements ||
					hasEnoughEnergy(availableEnergy, hermitInfo.secondary.cost)
				) {
					actions.push('SECONDARY_ATTACK')
				}
				if (
					!currentPlayer.board.singleUseCardUsed
					//&& suInfo?.damage
				) {
					actions.push('ZERO_ATTACK')
				}
			}
		}
	}

	let hasEmptyEffectSlot = false
	let hasEmptyItemSlot = false
	for (let i = 0; i < rows.length; i++) {
		if (!rows[i].hermitCard) continue
		hasEmptyEffectSlot = hasEmptyEffectSlot || !rows[i].effectCard
		hasEmptyItemSlot =
			hasEmptyItemSlot ||
			rows[i].itemCards.some((value) => {
				return !value
			})
	}

	if (
		!pastTurnActions.includes('PLAY_ITEM_CARD') &&
		!hasNoHermit &&
		hasItemInHand &&
		hasEmptyItemSlot
	)
		actions.push('PLAY_ITEM_CARD')

	if (!hasNoHermit && hasEffectInHand && hasEmptyEffectSlot) actions.push('PLAY_EFFECT_CARD')

	if (
		!pastTurnActions.includes('PLAY_SINGLE_USE_CARD') &&
		!hasNoHermit &&
		!currentPlayer.board.singleUseCard &&
		hasSingleUseInHand
	)
		actions.push('PLAY_SINGLE_USE_CARD')

	return actions
}

function getBlockedActions(game: GameModel): AvailableActionsT {
	const {currentPlayer, opponentPlayer} = game

	/** @type {AvailableActionsT} */
	const actions: AvailableActionsT = []

	const {activeRow, rows} = currentPlayer.board

	const isSlow = activeRow !== null && rows[activeRow]?.ailments.find((a) => a.id === 'slowness')

	if (isSlow) {
		actions.push('SECONDARY_ATTACK')
	}

	return actions
}

function playerAction(actionType: string, playerId: string) {
	return (action: any) => action.type === actionType && action.playerId === playerId
}

// return false in case one player is dead
function* checkHermitHealth(game: GameModel): SagaIterator {
	/** @type {Array<PlayerState>} */
	const playerStates: Array<PlayerState> = Object.values(game.state.players)
	/** @type {Array<string>} */
	const deadPlayerIds: Array<string> = []
	for (let playerState of playerStates) {
		const playerRows = playerState.board.rows
		const activeRow = playerState.board.activeRow
		for (let rowIndex in playerRows) {
			const row = playerRows[rowIndex]
			deathCode: if (row.hermitCard && row.health <= 0) {
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

function* sendGameState(game: GameModel, turnState: any) {
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

function* turnActionSaga(game: GameModel, turnAction: any, turnState: any): SagaIterator {
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
	const actionState: any = {
		...turnState,
		pickedSlots,
		modalResult,
	}
	let endTurn = false

	if (turnAction.type === 'PLAY_CARD') {
		const result = yield call(playCardSaga, game, turnAction, actionState)
		if (result === 'INVALID') pastTurnActions.push('PLAYED_INVALID_CARD')
		else if (!result) pastTurnActions.push('PLAY_CARD_FAILED')
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
		const typeAction = ATTACK_TO_ACTION[turnAction.payload.type as 'primary' | 'secondary' | 'zero']
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
	game.opponentPlayer.board.rows.forEach((row, index) => {
		const isSleeping = row.ailments.some((a) => a.id === 'sleeping')
		const isKnockedout = row.ailments.some((a) => a.id === 'knockedout')
		if (isSleeping && isKnockedout) {
			row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')
		}
	})

	const deadPlayerIds = yield call(checkHermitHealth, game)
	if (deadPlayerIds.length) endTurn = true

	return endTurn ? 'END_TURN' : 'DONE'
}

function* turnActionsSaga(
	game: GameModel,
	pastTurnActions: AvailableActionsT,
	turnConfig: {skipTurn?: boolean}
): SagaIterator {
	const {opponentPlayer, opponentPlayerId, currentPlayer, currentPlayerId} = game
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
			let availableEnergy: Array<EnergyT> = []

			const {activeRow} = game
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

			let blockedActions = getBlockedActions(game)
			let availableActions = getAvailableActions(game, pastTurnActions, availableEnergy)

			// Get blocked actions from hooks
			blockedActions = currentPlayer.hooks.blockedActions.call(
				blockedActions,
				pastTurnActions,
				availableEnergy
			)

			blockedActions.push(...DEBUG_CONFIG.blockedActions)

			// Block ZERO_ATTACK if PRIMARY_ATTACK or SECONDARY_ATTACK aren't blocked
			if (
				!blockedActions.includes('PRIMARY_ATTACK') ||
				!blockedActions.includes('SECONDARY_ATTACK')
			) {
				blockedActions.push('ZERO_ATTACK')
			}

			// Get available actions from hooks
			availableActions = currentPlayer.hooks.availableActions.call(
				availableActions,
				pastTurnActions,
				availableEnergy
			)

			// Remove blocked actions from the availableActions
			availableActions = availableActions.filter((action) => !blockedActions.includes(action))

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
			const opponentAvailableActions: AvailableActionsT =
				Object.keys(opponentPlayer.followUp).length > 0 ? ['FOLLOW_UP'] : ['WAIT_FOR_TURN']

			/** @type {TurnState} */
			const turnState: any = {
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
					for (const followUp of Object.keys(playerWithFollowUp.followUp)) {
						playerWithFollowUp.hooks.onFollowUpTimeout.call(followUp)
					}

					// Restore the previous time
					//@ts-ignore
					game.state.timer.turnTime = getTimerForSeconds(turnRemaining)
					continue
				} else if (!hasActiveHermit) {
					game.endInfo.reason = 'time'
					game.endInfo.deadPlayerIds = [currentPlayer.id]
					return 'GAME_END'
				} else {
					const newAttacks: Array<AttackModel> = []
					for (const player of [currentPlayer, opponentPlayer]) {
						player.hooks.onTurnTimeout.call(newAttacks)
					}
					if (newAttacks.length > 0) {
						runAllAttacks(newAttacks)
					}
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
			if (
				turnRemaining !== null &&
				((!opponentHasFollowUp && opponentFollowUp) ||
					(!playerHasFollowUp && playerFollowUp && turnRemaining !== undefined))
			) {
				game.state.timer.turnTime = getTimerForSeconds(turnRemaining)
			}
		}
	} finally {
		turnActionChannel.close()
	}
}

function* turnSaga(game: GameModel): SagaIterator {
	/** @type {AvailableActionsT} */
	const pastTurnActions: AvailableActionsT = []

	const {currentPlayerId, currentPlayer, opponentPlayer} = game

	game.state.turnPlayerId = currentPlayerId
	game.state.timer.turnTime = Date.now()
	game.state.timer.turnRemaining = CONFIG.limits.maxTurnTime

	/** @type {{skipTurn?: boolean}} */
	const turnConfig: {skipTurn?: boolean} = {}

	// Call turn start hooks
	currentPlayer.hooks.onTurnStart.call()

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
	const drawCards: Array<CardT | null> = []

	// Call turn end hooks
	currentPlayer.hooks.onTurnEnd.call(drawCards)

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
		const card = currentPlayer.pile.shift()
		drawCards.push(card || null)
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

function* gameSaga(game: GameModel): SagaIterator {
	if (!game.state) throw new Error('Trying to start uninitialized game')
	registerCards(game)

	const backgroundTasks = yield all([fork(chatSaga, game), fork(connectionStatusSaga, game)])

	while (true) {
		game.state.turn++
		const result = yield call(turnSaga, game)
		if (result === 'GAME_END') break
	}

	yield cancel(backgroundTasks)
}

export default gameSaga
