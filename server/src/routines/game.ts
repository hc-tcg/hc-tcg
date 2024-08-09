import {SingleUse} from 'common/cards/base/types'
import {
	CardComponent,
	DiscardSlotComponent,
	HandSlotComponent,
	PlayerComponent,
	SlotComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {CONFIG, DEBUG_CONFIG} from 'common/config'
import {PlayerEntity} from 'common/entities'
import {GameModel} from 'common/models/game-model'
import {
	AttackActionData,
	PickSlotActionData,
	attackToAttackAction,
} from 'common/types/action-data'
import {TypeT} from 'common/types/cards'
import {ActionResult, TurnAction, TurnActions} from 'common/types/game-state'
import {hasEnoughEnergy} from 'common/utils/attacks'
import {buffers} from 'redux-saga'
import {
	actionChannel,
	all,
	call,
	cancel,
	delay,
	fork,
	race,
	take,
} from 'typed-redux-saga'
import {printHooksState} from '../utils'
import {getLocalGameState} from '../utils/state-gen'
import chatSaga from './background/chat'
import connectionStatusSaga from './background/connection-status'
import applyEffectSaga from './turn-actions/apply-effect'
import attackSaga from './turn-actions/attack'
import changeActiveHermitSaga from './turn-actions/change-active-hermit'
import modalRequestSaga from './turn-actions/modal-request'
import pickRequestSaga from './turn-actions/pick-request'
import playCardSaga from './turn-actions/play-card'
import removeEffectSaga from './turn-actions/remove-effect'
import {virtualPlayerActionSaga} from './virtual'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

export const getTimerForSeconds = (seconds: number): number => {
	const maxTime = CONFIG.limits.maxTurnTime * 1000
	return Date.now() - maxTime + seconds * 1000
}

function getAvailableEnergy(game: GameModel) {
	const {currentPlayer} = game

	const energy = game.components
		.filter(
			CardComponent,
			query.card.isItem,
			query.card.attached,
			query.card.rowEntity(currentPlayer.activeRowEntity),
			query.card.slot(query.slot.player(game.currentPlayer.entity)),
		)
		.flatMap((card) => {
			if (!card.isItem()) return []
			return card.props.energy
		})

	return currentPlayer.hooks.availableEnergy.call(energy)
}

/**Returns if an action is currently available for the player to execute.
 * To be available, an action must be in `state.turn.availableActions`, and not in `state.turn.blockedActions` or
 * `state.turn.completedActions`.
 */
function getAvailableActions(
	game: GameModel,
	availableEnergy: Array<TypeT>,
): TurnActions {
	const {turn: turnState, pickRequests, modalRequests} = game.state
	const {currentPlayer} = game
	const {activeRowEntity: activeRowId, singleUseCardUsed: suUsed} =
		currentPlayer
	const actions: TurnActions = []

	const su = game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	) as CardComponent<SingleUse> | null

	// Custom modals
	if (modalRequests.length > 0) {
		const request = modalRequests[0]
		if (request.player === currentPlayer.entity) {
			return ['MODAL_REQUEST']
		} else {
			// Activate opponent action timer
			if (game.state.timer.opponentActionStartTime === null) {
				game.state.timer.turnStartTime = Date.now()
				game.state.timer.opponentActionStartTime = Date.now()
			}
			return ['WAIT_FOR_OPPONENT_ACTION']
		}
	}

	// Pick requests
	if (pickRequests.length > 0) {
		const request = pickRequests[0]
		if (request.player === currentPlayer.entity) {
			let pickActions: TurnActions = ['PICK_REQUEST']
			if (su && !suUsed) {
				pickActions.push('REMOVE_EFFECT')
			}
			return pickActions
		} else {
			// Activate opponent action timer
			if (game.state.timer.opponentActionStartTime === null) {
				game.state.timer.turnStartTime = Date.now()
				game.state.timer.opponentActionStartTime = Date.now()
			}
			return ['WAIT_FOR_OPPONENT_ACTION']
		}
	}

	// There is no action currently active for the opponent, clear the time
	game.state.timer.opponentActionStartTime = null
	const hasOtherHermit = game.components.exists(
		CardComponent,
		query.card.currentPlayer,
		query.card.slot(query.slot.hermit),
		query.card.slot(query.not(query.slot.active)),
	)

	// Actions that require us to have an active row
	if (activeRowId !== null) {
		// Change active hermit
		if (hasOtherHermit) {
			actions.push('CHANGE_ACTIVE_HERMIT')
		}

		// Su actions
		if (su && !suUsed) {
			actions.push('REMOVE_EFFECT')
			actions.push('APPLY_EFFECT')
		}

		// Attack actions
		if (activeRowId !== null && turnState.turnNumber > 1) {
			const hermitCard = game.components.find(
				CardComponent,
				query.card.slot(query.slot.rowIs(activeRowId), query.slot.hermit),
			)

			// only add attack options if not sleeping
			if (hermitCard && hermitCard.card.isHermit()) {
				if (
					hasEnoughEnergy(availableEnergy, hermitCard.card.props.primary.cost)
				) {
					actions.push('PRIMARY_ATTACK')
				}
				if (
					hasEnoughEnergy(availableEnergy, hermitCard.card.props.secondary.cost)
				) {
					actions.push('SECONDARY_ATTACK')
				}
				if (su && !suUsed) {
					if (su && su.card.props.hasAttack) {
						actions.push('SINGLE_USE_ATTACK')
					}
				}
			}
		}

		// End turn action
		actions.push('END_TURN')
	}

	// Play card actions require an active row unless it's the players first turn
	if (activeRowId !== null || turnState.turnNumber <= 2) {
		// Temporarily add these to see if any slots are available
		game.state.turn.availableActions.push(
			'PLAY_HERMIT_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_SINGLE_USE_CARD',
		)
		const desiredActions = game.components
			.filter(
				CardComponent,
				query.card.slot(
					query.slot.player(currentPlayer.entity),
					query.slot.hand,
				),
			)
			.reduce((reducer: TurnActions, card: CardComponent): TurnActions => {
				const pickableSlots = game.components.filter(
					SlotComponent,
					card.card.props.attachCondition,
				)

				if (pickableSlots.length === 0) return reducer

				if (card.card.isHealth() && !reducer.includes('PLAY_HERMIT_CARD')) {
					return [...reducer, 'PLAY_HERMIT_CARD']
				}
				if (card.card.isAttach() && !reducer.includes('PLAY_EFFECT_CARD')) {
					return [...reducer, 'PLAY_EFFECT_CARD']
				}
				if (card.card.isItem() && !reducer.includes('PLAY_ITEM_CARD')) {
					return [...reducer, 'PLAY_ITEM_CARD']
				}
				if (
					card.card.isSingleUse() &&
					!reducer.includes('PLAY_SINGLE_USE_CARD')
				) {
					return [...reducer, 'PLAY_SINGLE_USE_CARD']
				}
				return reducer
			}, [] as TurnActions)
		game.state.turn.availableActions = []
		actions.push(...desiredActions)
	}

	// Filter out actions that have already been completed - once an action is completed it cannot be used again for the turn
	// Also filter out blocked actions
	const blockedActions = game.getAllBlockedActions()
	let filteredActions = actions.filter((action) => {
		return (
			!turnState.completedActions.includes(action) &&
			!blockedActions.includes(action)
		)
	})

	// Force add change active hermit if the active row is null
	if (activeRowId === null && hasOtherHermit) {
		filteredActions.push('CHANGE_ACTIVE_HERMIT')
	}

	return filteredActions
}

function playerAction(actionType: string, playerEntity: PlayerEntity) {
	return (action: any) =>
		action.type === 'TURN_ACTION' &&
		action.payload.type === actionType &&
		action.payload.playerEntity === playerEntity
}

// return false in case one player is dead
// @TODO completely redo how we calculate if a hermit is dead etc
function* checkHermitHealth(game: GameModel) {
	const deadPlayers: Array<PlayerComponent> = []
	for (let playerState of game.components.filter(PlayerComponent)) {
		// Players are not allowed to die before they place their first hermit to prevent bugs
		if (!playerState.hasPlacedHermit) {
			continue
		}

		const hermitCards = game.components.filter(
			CardComponent,
			query.card.attached,
			query.card.slot(query.slot.hermit),
			query.card.player(playerState.entity),
		)

		for (const card of hermitCards) {
			if (!card.slot?.inRow()) continue
			if (card.slot?.row?.health) continue
			// Add battle log entry. Non Hermit cards can create their detach message themselves.
			if (card.props.category === 'hermit') {
				game.battleLog.addDeathEntry(playerState.entity, card.slot.row.entity)
			}

			if (card.slot.row.entity === playerState.activeRowEntity) {
				playerState.activeRowEntity = null
			}

			// We wait to discard becuse you can not change from a row with no hermits to a new active row.
			card.slot.row.health = null
			card.slot.row.getAttach()?.discard()
			card.slot.row.getItems().map((item) => item.discard())
			card.discard()

			// Only hermit cards give points
			if (card.props.category === 'hermit') {
				playerState.lives -= 1

				// reward card
				if (game.rules.disableRewardCards) continue
				game.components
					.filter(
						CardComponent,
						query.card.slot(query.slot.deck),
						query.card.player(playerState.entity),
					)
					.sort(CardComponent.compareOrder)
					.at(0)
					?.draw(playerState.opponentPlayer.entity)
			}
		}

		const isDead = playerState.lives <= 0

		const noHermitsLeft = !game.components.exists(
			CardComponent,
			query.card.player(playerState.entity),
			query.card.attached,
			query.card.slot(query.slot.hermit),
		)
		if (isDead || noHermitsLeft) {
			deadPlayers.push(playerState)
		}
	}

	return deadPlayers
}

function* sendGameState(game: GameModel) {
	game.viewers.forEach((viewer) => {
		const localGameState = getLocalGameState(game, viewer)

		viewer.player.socket.emit('GAME_STATE', {
			type: 'GAME_STATE',
			payload: {
				localGameState,
			},
		})
	})
}

function* turnActionSaga(game: GameModel, turnAction: any) {
	const actionType = turnAction.type as TurnAction

	let endTurn = false

	const availableActions =
		turnAction.playerEntity === game.currentPlayer.entity
			? game.state.turn.availableActions
			: game.state.turn.opponentAvailableActions

	// We don't check if slot actions are available because the playCardSaga will verify that.
	if (
		[
			'SINGLE_USE_ATTACK',
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'CHANGE_ACTIVE_HERMIT',
			'APPLY_EFFECT',
			'REMOVE_EFFECT',
			'PICK_REQUEST',
			'MODAL_REQUEST',
			'END_TURN',
		].includes(actionType) &&
		!availableActions.includes(actionType)
	) {
		game.setLastActionResult(actionType, 'FAILURE_ACTION_NOT_AVAILABLE')
		return
	}

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
			result = yield* call(attackSaga, game, turnAction)
			break
		case 'CHANGE_ACTIVE_HERMIT':
			result = yield* call(changeActiveHermitSaga, game, turnAction)
			break
		case 'APPLY_EFFECT':
			result = yield* call(applyEffectSaga, game, turnAction)
			break
		case 'REMOVE_EFFECT':
			result = yield* call(removeEffectSaga, game)
			break
		case 'PICK_REQUEST':
			result = yield* call(
				pickRequestSaga,
				game,
				(turnAction as PickSlotActionData)?.payload.entity,
			)
			break
		case 'MODAL_REQUEST':
			result = yield* call(
				modalRequestSaga,
				game,
				turnAction?.payload?.modalResult,
			)
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

	let deadPlayers = []
	deadPlayers.push(...(yield* call(checkDeckedOut, game)))
	deadPlayers.push(...(yield* call(checkHermitHealth, game)))
	if (deadPlayers.length) endTurn = true

	if (endTurn) {
		return 'END_TURN'
	}
}

function getPlayerAI(game: GameModel) {
	const activePlayerEntity = game.state.turn.opponentAvailableActions.includes(
		'WAIT_FOR_TURN',
	)
		? game.currentPlayerEntity
		: game.opponentPlayerEntity

	return game.components.find(
		AIComponent,
		(_game, ai) => ai.playerEntity === activePlayerEntity,
	)
}

function* turnActionsSaga(game: GameModel) {
	const {opponentPlayer, currentPlayer} = game

	const turnActionChannel = yield* actionChannel(
		[
			...['PICK_REQUEST', 'MODAL_REQUEST'].map((type) =>
				playerAction(type, opponentPlayer.entity),
			),
			...[
				'PLAY_HERMIT_CARD',
				'PLAY_ITEM_CARD',
				'PLAY_EFFECT_CARD',
				'PLAY_SINGLE_USE_CARD',
				'PICK_REQUEST',
				'MODAL_REQUEST',
				'CHANGE_ACTIVE_HERMIT',
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'SINGLE_USE_ATTACK',
				'PRIMARY_ATTACK',
				'SECONDARY_ATTACK',
				'END_TURN',
			].map((type) => playerAction(type, currentPlayer.entity)),
		],
		buffers.dropping(10),
	)

	try {
		while (true) {
			if (DEBUG_CONFIG.showHooksState.enabled) printHooksState(game)

			// Available actions code
			const availableEnergy = getAvailableEnergy(game)
			let blockedActions: Array<TurnAction> = []
			let availableActions = getAvailableActions(game, availableEnergy)

			// Get blocked actions from hooks
			// @TODO this should also not really be a hook anymore
			// @TODO not only that but the blocked actions implementation needs improving, another card needs to be unable to remove another's block
			currentPlayer.hooks.blockedActions.call(blockedActions)

			blockedActions.push(...DEBUG_CONFIG.blockedActions)

			// Remove blocked actions from the availableActions
			availableActions = availableActions.filter(
				(action) => !blockedActions.includes(action),
			)

			availableActions.push(...DEBUG_CONFIG.availableActions)

			// Set final actions in state
			let opponentAction: TurnAction = 'WAIT_FOR_TURN'
			if (game.state.pickRequests[0]?.player === opponentPlayer.entity) {
				opponentAction = 'PICK_REQUEST'
			} else if (
				game.state.modalRequests[0]?.player === opponentPlayer.entity
			) {
				opponentAction = 'MODAL_REQUEST'
			}
			game.state.turn.opponentAvailableActions = [opponentAction]
			game.state.turn.availableActions = availableActions

			if (
				DEBUG_CONFIG.autoEndTurn &&
				availableActions.includes('END_TURN') &&
				availableActions.length === 1
			) {
				break
			}

			// Timer calculation
			game.state.timer.turnStartTime =
				game.state.timer.turnStartTime || Date.now()
			let maxTime = CONFIG.limits.maxTurnTime * 1000
			let remainingTime = game.state.timer.turnStartTime + maxTime - Date.now()

			if (availableActions.includes('WAIT_FOR_OPPONENT_ACTION')) {
				game.state.timer.opponentActionStartTime =
					game.state.timer.opponentActionStartTime || Date.now()
				maxTime = CONFIG.limits.extraActionTime * 1000
				remainingTime =
					game.state.timer.opponentActionStartTime + maxTime - Date.now()
			}

			const graceTime = 1000
			game.state.timer.turnRemaining = Math.floor(remainingTime + graceTime)

			yield* call(sendGameState, game)
			game.battleLog.sendLogs()

			const playerAI = getPlayerAI(game)
			if (playerAI) yield* fork(virtualPlayerActionSaga, game, playerAI)

			const raceResult = yield* race({
				turnAction: take(turnActionChannel),
				timeout: delay(remainingTime + graceTime),
			}) as any // @NOTE - need to type as any due to typed-redux-saga inferring the wrong return type for action channel

			// Reset coin flips
			currentPlayer.coinFlips = []
			opponentPlayer.coinFlips = []

			// Handle timeout
			if (raceResult.timeout) {
				// @TODO this works, but could be cleaned
				const currentAttack = game.state.turn.currentAttack
				let reset = false

				// First check to see if the opponent had a pick request active
				const currentPickRequest = game.state.pickRequests[0]
				if (currentPickRequest) {
					if (currentPickRequest.player === currentPlayer.entity) {
						if (!!currentAttack) {
							reset = true
						}
					} else {
						reset = true
					}
				}

				// Check to see if the opponent had a modal request active
				const currentModalRequest = game.state.modalRequests[0]
				if (currentModalRequest) {
					if (currentModalRequest.player === currentPlayer.entity) {
						if (!!currentAttack) {
							reset = true
						}
					} else {
						reset = true
					}
				}

				if (reset) {
					// Timeout current request and remove it
					if (currentPickRequest) {
						game.removePickRequest()
					} else {
						game.removeModalRequest()
					}

					// Reset timer to max time
					game.state.timer.turnStartTime = Date.now()
					game.state.timer.turnRemaining = CONFIG.limits.maxTurnTime

					// Execute attack now if there's a current attack
					if (!game.hasActiveRequests() && !!currentAttack) {
						// There are no active requests left, and we're in the middle of an attack. Execute it now.
						const turnAction: AttackActionData = {
							type: attackToAttackAction[currentAttack],
							payload: {
								player: game.currentPlayer.entity,
							},
						}
						yield* call(attackSaga, game, turnAction, false)
					}

					continue
				}

				const hasActiveHermit = game.components.exists(
					CardComponent,
					query.card.player(currentPlayer.entity),
					query.card.slot(query.slot.active, query.slot.hermit),
				)
				if (hasActiveHermit) {
					break
				}

				game.endInfo.reason = 'time'
				game.endInfo.deadPlayerIds = [currentPlayer.entity]
				return 'GAME_END'
			}

			// Run action logic
			const result = yield* call(
				turnActionSaga,
				game,
				raceResult.turnAction.payload,
			)

			if (result === 'END_TURN') {
				break
			}
		}
	} finally {
		turnActionChannel.close()
	}
}

export function* turnSaga(game: GameModel) {
	const {currentPlayer, opponentPlayer} = game

	// Reset turn state
	game.state.turn.availableActions = []
	game.state.turn.completedActions = []
	game.state.turn.blockedActions = {}
	game.state.turn.currentAttack = null
	currentPlayer.singleUseCardUsed = false
	opponentPlayer.singleUseCardUsed = false

	game.state.timer.turnStartTime = Date.now()
	game.state.timer.turnRemaining = CONFIG.limits.maxTurnTime * 1000

	// Call turn start hooks

	currentPlayer.hooks.onTurnStart.call()

	// Check for dead hermits on turn start
	if (game.state.turn.turnNumber > 2) {
		const turnStartDeadPlayers = yield* call(checkHermitHealth, game)
		if (turnStartDeadPlayers.length) {
			game.endInfo.reason =
				turnStartDeadPlayers[0].lives <= 0 ? 'lives' : 'hermits'
			game.endInfo.deadPlayerIds = turnStartDeadPlayers.map(
				(player) => player.entity,
			)
			return 'GAME_END'
		}
	}

	const result = yield* call(turnActionsSaga, game)
	if (result === 'GAME_END') return 'GAME_END'

	// Draw a card from deck when turn ends
	let drawCards = currentPlayer.draw(1)

	// Call turn end hooks
	currentPlayer.hooks.onTurnEnd.call(drawCards)

	// Timeout and clear pick requests
	const pickRequests = game.state.pickRequests
	for (let i = 0; i < pickRequests.length; i++) {
		pickRequests[i].onTimeout?.()
	}
	game.state.pickRequests = []

	// Timeout and clear modal requests
	const modalRequests = game.state.modalRequests
	for (let i = 0; i < modalRequests.length; i++) {
		modalRequests[i].onTimeout()
	}
	game.state.modalRequests = []

	let deadPlayers: Array<PlayerComponent> = []
	deadPlayers.push(...(yield* call(checkHermitHealth, game)))
	deadPlayers.push(...(yield* call(checkDeckedOut, game)))

	if (deadPlayers.length) {
		if (deadPlayers[0].deckedOut) {
			game.endInfo.reason = 'cards'
		} else if (deadPlayers[0].lives <= 0) {
			game.endInfo.reason = 'lives'
		} else {
			game.endInfo.reason = 'hermits'
		}
		game.endInfo.deadPlayerIds = deadPlayers.map((player) => player.entity)
		return 'GAME_END'
	}

	// If player has not used his single use card return it to hand
	// otherwise move it to discarded pile
	const singleUseCard = game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	)
	if (singleUseCard) {
		if (!currentPlayer.singleUseCardUsed) {
			singleUseCard.attach(
				game.components.new(HandSlotComponent, currentPlayer.entity),
			)
		} else {
			singleUseCard.attach(
				game.components.new(DiscardSlotComponent, currentPlayer.entity),
			)
		}
	}

	game.battleLog.addTurnEndEntry()

	return 'DONE'
}

function* checkDeckedOut(game: GameModel) {
	if (
		DEBUG_CONFIG.disableDeckOut ||
		DEBUG_CONFIG.startWithAllCards ||
		DEBUG_CONFIG.unlimitedCards
	)
		return []
	return [game.currentPlayer, game.opponentPlayer].flatMap((player) => {
		if (player.deckedOut) return [player]
		return []
	})
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
