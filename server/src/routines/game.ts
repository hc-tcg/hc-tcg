import {SingleUse} from 'common/cards/types'
import {
	CardComponent,
	DiscardSlotComponent,
	HandSlotComponent,
	PlayerComponent,
	SlotComponent,
} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {PlayerEntity} from 'common/entities'
import {GameModel} from 'common/models/game-model'
import {serverMessages} from 'common/socket-messages/server-messages'
import {TypeT} from 'common/types/cards'
import {GameOutcome, TurnAction, TurnActions} from 'common/types/game-state'
import {
	AttackActionData,
	PickSlotActionData,
	attackToAttackAction,
} from 'common/types/turn-action-data'
import {hasEnoughEnergy} from 'common/utils/attacks'
import {buffers} from 'redux-saga'
import {actionChannel, call, delay, fork, race, take} from 'typed-redux-saga'
import {printBoardState, printHooksState} from '../utils'
import {broadcast} from '../utils/comm'
import {getLocalGameState} from '../utils/state-gen'

import assert from 'assert'
import {LocalMessage, LocalMessageTable, localMessages} from '../messages'
import {
	applyEffectSaga,
	attackSaga,
	changeActiveHermitSaga,
	modalRequestSaga,
	pickRequestSaga,
	playCardSaga,
	removeEffectSaga,
} from './turn-actions'
import {virtualPlayerActionSaga} from './virtual'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

export const getTimerForSeconds = (
	game: GameModel,
	seconds: number,
): number => {
	const maxTime = game.settings.maxTurnTime * 1000
	return Date.now() - maxTime + seconds * 1000
}

export function getAvailableEnergy(game: GameModel) {
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

export function figureOutGameResult(game: GameModel): GameOutcome {
	assert(
		game.endInfo.deadPlayerEntities.length !== 0,
		'Games can not end without at least one dead player',
	)
	assert(
		game.endInfo.victoryReason !== undefined,
		'Games can not end without a reason',
	)

	if (game.endInfo.deadPlayerEntities.length === 2) {
		return {type: 'tie'}
	}

	let alivePlayer = game.components.findEntity(
		PlayerComponent,
		(game, component) =>
			!game.endInfo.deadPlayerEntities.includes(component.entity),
	)
	assert(
		alivePlayer,
		'The game must have a living player at the end if it was not a draw',
	)

	return {
		type: 'player-won',
		winner: alivePlayer,
		victoryReason: game.endInfo.victoryReason,
	}
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
		(_game, value) =>
			currentPlayer.hooks.beforeActiveRowChange
				.call(currentPlayer.getActiveHermit(), value)
				.every(Boolean),
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
			if (su.props.showConfirmationModal) actions.push('APPLY_EFFECT')
		}

		// Attack actions
		if (activeRowId !== null && turnState.turnNumber > 1) {
			const hermitCard = game.components.find(
				CardComponent,
				query.card.slot(query.slot.rowIs(activeRowId), query.slot.hermit),
			)

			// only add attack options if not sleeping
			if (hermitCard && hermitCard.isHermit()) {
				if (
					hasEnoughEnergy(
						availableEnergy,
						hermitCard.getAttackCost('primary'),
						game.settings.noItemRequirements,
					) &&
					!hermitCard.props.primary.passive
				) {
					actions.push('PRIMARY_ATTACK')
				}
				if (
					hasEnoughEnergy(
						availableEnergy,
						hermitCard.getAttackCost('secondary'),
						game.settings.noItemRequirements,
					) &&
					!hermitCard.props.secondary.passive
				) {
					actions.push('SECONDARY_ATTACK')
				}
				if (su && !suUsed) {
					if (su && su.props.hasAttack) {
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
		game.state.turn.availableActions = [
			...actions,
			'PLAY_HERMIT_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_SINGLE_USE_CARD',
		]
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
					card.props.attachCondition,
				)

				if (pickableSlots.length === 0) return reducer

				if (card.isHealth() && !reducer.includes('PLAY_HERMIT_CARD')) {
					reducer.push('PLAY_HERMIT_CARD')
				}
				if (card.isAttach() && !reducer.includes('PLAY_EFFECT_CARD')) {
					reducer.push('PLAY_EFFECT_CARD')
				}
				if (card.isItem() && !reducer.includes('PLAY_ITEM_CARD')) {
					reducer.push('PLAY_ITEM_CARD')
				}
				if (card.isSingleUse() && !reducer.includes('PLAY_SINGLE_USE_CARD')) {
					reducer.push('PLAY_SINGLE_USE_CARD')
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
	return (actionAny: any) => {
		const action = actionAny as LocalMessage
		return (
			action.type === localMessages.GAME_TURN_ACTION &&
			'playerEntity' in action &&
			'action' in action &&
			action.action.type === actionType &&
			action.playerEntity === playerEntity
		)
	}
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
			card.slot.row.getItems(true).map((item) => item.discard())
			card.discard()

			// Only hermit cards give points
			if (card.props.category === 'hermit') {
				playerState.lives -= 1

				// reward card
				if (game.settings.disableRewardCards) continue
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

		broadcast([viewer.player], {
			type: serverMessages.GAME_STATE,
			localGameState,
		})
	})

	game.voiceLineQueue = []
}

function* turnActionSaga(
	game: GameModel,
	turnAction: LocalMessageTable[typeof localMessages.GAME_TURN_ACTION],
) {
	const actionType = turnAction.action.type

	let endTurn = false

	const availableActions =
		turnAction.playerEntity === game.currentPlayer.entity
			? game.state.turn.availableActions
			: game.state.turn.opponentAvailableActions

	try {
		// We don't check if slot actions are available because the playCardSaga will verify that.
		// Forfeits are always able to be used so they are not checked.
		assert(
			![
				'SINGLE_USE_ATTACK',
				'PRIMARY_ATTACK',
				'SECONDARY_ATTACK',
				'CHANGE_ACTIVE_HERMIT',
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'PICK_REQUEST',
				'MODAL_REQUEST',
				'END_TURN',
			].includes(actionType) || availableActions.includes(actionType),
			'Players cannot be able to use a blocked action. This may be because the user does not have enough energy for the attack.',
		)

		switch (actionType) {
			case 'PLAY_HERMIT_CARD':
			case 'PLAY_ITEM_CARD':
			case 'PLAY_EFFECT_CARD':
			case 'PLAY_SINGLE_USE_CARD':
				yield* call(playCardSaga, game, turnAction.action)
				break
			case 'SINGLE_USE_ATTACK':
			case 'PRIMARY_ATTACK':
			case 'SECONDARY_ATTACK':
				yield* call(attackSaga, game, turnAction.action)
				break
			case 'CHANGE_ACTIVE_HERMIT':
				yield* call(changeActiveHermitSaga, game, turnAction.action)
				break
			case 'APPLY_EFFECT':
				yield* call(applyEffectSaga, game, turnAction.action)
				break
			case 'REMOVE_EFFECT':
				yield* call(removeEffectSaga, game)
				break
			case 'PICK_REQUEST':
				yield* call(
					pickRequestSaga,
					game,
					(turnAction.action as PickSlotActionData)?.entity,
				)
				break
			case 'MODAL_REQUEST':
				yield* call(modalRequestSaga, game, turnAction?.action?.modalResult)
				break
			case 'END_TURN':
				endTurn = true
				// Turn end actions are not in the battle log, so we log them to stdout manually.
				if (game.settings.verboseLogging) {
					console.info(
						`${game.logHeader} ${game.currentPlayer.playerName} ended their turn.`,
					)
				}
				break
			case 'DELAY':
				yield* call(sendGameState, game)
				break
			case 'FORFEIT':
				game.endInfo.deadPlayerEntities = [turnAction.action.player]
				return 'FORFEIT'
			default:
				// Unknown action type, ignore it completely
				throw new Error(
					`Recieved an action ${actionType} that does not exist. This is impossible.`,
				)
		}
	} catch (e) {
		if (game.settings.logErrorsToStderr) {
			console.error(`${game.logHeader} ${(e as Error).stack}`.trimStart())
		} else {
			throw e
		}
	}

	// We log endTurn at the start of the turn so the state updates properly.
	if (game.settings.verboseLogging && !endTurn) {
		printBoardState(game)
	}

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

function* turnActionsSaga(game: GameModel, turnActionChannel: any) {
	const {opponentPlayer, currentPlayer} = game

	let playerAISagaRunning: boolean = false

	while (true) {
		if (game.settings.showHooksState.enabled) printHooksState(game)

		// Available actions code
		const availableEnergy = getAvailableEnergy(game)
		let blockedActions: Array<TurnAction> = []
		let availableActions = getAvailableActions(game, availableEnergy)

		// Get blocked actions from hooks
		// @TODO this should also not really be a hook anymore
		// @TODO not only that but the blocked actions implementation needs improving, another card needs to be unable to remove another's block
		currentPlayer.hooks.blockedActions.call(blockedActions)

		blockedActions.push(...game.settings.blockedActions)

		// Remove blocked actions from the availableActions
		availableActions = availableActions.filter(
			(action) => !blockedActions.includes(action),
		)

		availableActions.push(...game.settings.availableActions)

		// Set final actions in state
		let opponentAction: TurnAction = 'WAIT_FOR_TURN'
		if (game.state.pickRequests[0]?.player === opponentPlayer.entity) {
			opponentAction = 'PICK_REQUEST'
		} else if (game.state.modalRequests[0]?.player === opponentPlayer.entity) {
			opponentAction = 'MODAL_REQUEST'
		}
		game.state.turn.opponentAvailableActions = [opponentAction]
		game.state.turn.availableActions = availableActions

		if (
			game.settings.autoEndTurn &&
			availableActions.includes('END_TURN') &&
			availableActions.length === 1
		) {
			break
		}

		// Timer calculation
		game.state.timer.turnStartTime =
			game.state.timer.turnStartTime || Date.now()
		let maxTime = game.settings.maxTurnTime * 1000
		let remainingTime = game.state.timer.turnStartTime + maxTime - Date.now()

		if (availableActions.includes('WAIT_FOR_OPPONENT_ACTION')) {
			game.state.timer.opponentActionStartTime =
				game.state.timer.opponentActionStartTime || Date.now()
			maxTime = game.settings.extraActionTime * 1000
			remainingTime =
				game.state.timer.opponentActionStartTime + maxTime - Date.now()
		}

		const graceTime = 1000
		game.state.timer.turnRemaining = Math.floor(remainingTime + graceTime)

		yield* call(sendGameState, game)
		game.battleLog.sendLogs()

		const playerAI = getPlayerAI(game)
		if (playerAI && !playerAISagaRunning) {
			yield* fork(function* () {
				playerAISagaRunning = true
				yield* call(virtualPlayerActionSaga, game, playerAI)
				playerAISagaRunning = false
			})
		}

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
				game.state.timer.turnRemaining = game.settings.maxTurnTime

				// Execute attack now if there's a current attack
				if (!game.hasActiveRequests() && !!currentAttack) {
					// There are no active requests left, and we're in the middle of an attack. Execute it now.
					const turnAction: AttackActionData = {
						type: attackToAttackAction[currentAttack],
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

			game.endInfo.victoryReason = 'timeout-without-hermits'
			game.endInfo.deadPlayerEntities = [currentPlayer.entity]
			return 'GAME_END'
		}

		// Run action logic
		const result = yield* call(turnActionSaga, game, raceResult.turnAction)

		if (result === 'END_TURN') {
			break
		}
		if (result === 'FORFEIT') {
			game.endInfo.victoryReason = 'forfeit'
			return 'GAME_END'
		}
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
	game.state.timer.turnRemaining = game.settings.maxTurnTime * 1000

	game.battleLog.addTurnStartEntry()

	// Call turn start hooks
	currentPlayer.hooks.onTurnStart.call()

	if (game.settings.verboseLogging) {
		printBoardState(game)
	}

	// Check for dead hermits on turn start
	if (game.state.turn.turnNumber > 2) {
		const turnStartDeadPlayers = yield* call(checkHermitHealth, game)
		if (turnStartDeadPlayers.length) {
			game.endInfo.victoryReason = turnStartDeadPlayers.every(
				(deadPlayer) => deadPlayer.lives <= 0,
			)
				? 'lives'
				: 'no-hermits-on-board'
			game.endInfo.deadPlayerEntities = turnStartDeadPlayers.map(
				(player) => player.entity,
			)
			return 'GAME_END'
		}
	}

	const turnActionChannel = yield* actionChannel(
		[
			...['PICK_REQUEST', 'MODAL_REQUEST', 'FORFEIT'].map((type) =>
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
				'DELAY',
				'FORFEIT',
			].map((type) => playerAction(type, currentPlayer.entity)),
		],
		buffers.dropping(10),
	)

	let result
	try {
		result = yield* call(turnActionsSaga, game, turnActionChannel)
	} finally {
		turnActionChannel.close()
	}

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

	const deadPlayers: PlayerComponent[] = yield* call(checkHermitHealth, game)
	if (deadPlayers.length) {
		if (deadPlayers.every((player) => player.lives <= 0)) {
			game.endInfo.victoryReason = 'lives'
		} else {
			game.endInfo.victoryReason = 'no-hermits-on-board'
		}
		game.endInfo.deadPlayerEntities = deadPlayers.map((player) => player.entity)
		return 'GAME_END'
	}

	const deckedOutPlayers: PlayerEntity[] = yield* call(checkDeckedOut, game)
	if (deckedOutPlayers.length) {
		game.endInfo.victoryReason = 'decked-out'
		game.endInfo.deadPlayerEntities = deckedOutPlayers
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

	return 'DONE'
}

function* checkDeckedOut(game: GameModel) {
	if (
		game.settings.disableDeckOut ||
		game.settings.startWithAllCards ||
		game.settings.unlimitedCards
	)
		return []
	return game.components.filterEntities(
		PlayerComponent,
		(_game, player) => player.deckedOut,
	)
}

function* gameSaga(game: GameModel) {
	if (game.settings.verboseLogging)
		console.info(
			`${game.logHeader} ${game.opponentPlayer.playerName} was decided to be the first player.`,
		)
	while (true) {
		game.state.turn.turnNumber++
		const result = yield* call(turnSaga, game)
		if (result === 'GAME_END') break
	}
	game.outcome = figureOutGameResult(game)
}

export default gameSaga
