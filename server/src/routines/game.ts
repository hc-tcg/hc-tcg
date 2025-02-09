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

import assert from 'assert'
import {GameController} from 'game-controller'
import {LocalMessage, LocalMessageTable, localMessages} from '../messages'
import {
	applyEffectAction,
	attackAction,
	changeActiveHermitAction,
	modalRequestAction,
	pickRequestAction,
	playCardAction,
	removeEffectAction,
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

	/** Players must immediately either apply or remove single use cards that show confirmation modal */
	let mustHandleConfirmation: boolean = false

	// Actions that require us to have an active row
	actionsWithActiveRow: if (activeRowId !== null) {
		// End turn action
		actions.push('END_TURN')

		// Su actions
		if (su && !suUsed) {
			actions.push('REMOVE_EFFECT')
			if (su.props.showConfirmationModal) {
				actions.push('APPLY_EFFECT')
				mustHandleConfirmation = true
				break actionsWithActiveRow
			}
		}

		// Change active hermit
		if (hasOtherHermit) {
			actions.push('CHANGE_ACTIVE_HERMIT')
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
	}

	// Play card actions require an active row unless it's the players first turn
	if (
		!mustHandleConfirmation &&
		(activeRowId !== null || turnState.turnNumber <= 2)
	) {
		const desiredActions = game.components
			.filter(
				CardComponent,
				query.card.slot(
					query.slot.player(currentPlayer.entity),
					query.slot.hand,
				),
			)
			.reduce((reducer: TurnActions, card: CardComponent): TurnActions => {
				// See Issue #1205
				if (card.isHealth() && !reducer.includes('PLAY_HERMIT_CARD')) {
					game.state.turn.availableActions = [...actions, 'PLAY_HERMIT_CARD']
					const pickableSlots = game.components.filter(
						SlotComponent,
						card.props.attachCondition,
					)
					if (pickableSlots.length !== 0) reducer.push('PLAY_HERMIT_CARD')
				}
				if (card.isAttach() && !reducer.includes('PLAY_EFFECT_CARD')) {
					game.state.turn.availableActions = [...actions, 'PLAY_EFFECT_CARD']
					const pickableSlots = game.components.filter(
						SlotComponent,
						card.props.attachCondition,
					)
					if (pickableSlots.length !== 0) reducer.push('PLAY_EFFECT_CARD')
				}
				if (card.isItem() && !reducer.includes('PLAY_ITEM_CARD')) {
					game.state.turn.availableActions = [...actions, 'PLAY_ITEM_CARD']
					const pickableSlots = game.components.filter(
						SlotComponent,
						card.props.attachCondition,
					)
					if (pickableSlots.length !== 0) reducer.push('PLAY_ITEM_CARD')
				}
				if (card.isSingleUse() && !reducer.includes('PLAY_SINGLE_USE_CARD')) {
					game.state.turn.availableActions = [
						...actions,
						'PLAY_SINGLE_USE_CARD',
					]
					const pickableSlots = game.components.filter(
						SlotComponent,
						card.props.attachCondition,
					)
					if (pickableSlots.length !== 0) reducer.push('PLAY_SINGLE_USE_CARD')
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
function checkHermitHealth(game: GameModel) {
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
			let row = card.slot.row
			row.health = null
			row.getAttach()?.discard()
			row.getItems(true).map((item) => item.discard())
			card.discard()

			if (card.isHealth()) {
				row.hooks.onKnockOut.call(card)
			}

			// Only hermit cards give points
			if (card.props.category === 'hermit') {
				playerState.lives -= 1

				// prize card
				if (game.settings.disableRewardCards) continue
				const prizeCard = game.components
					.filter(
						CardComponent,
						query.card.slot(query.slot.deck),
						query.card.player(playerState.entity),
					)
					.sort(CardComponent.compareOrder)
					.at(0)
				if (prizeCard) {
					prizeCard.prizeCard = true
					prizeCard.draw(playerState.opponentPlayer.entity)
				}
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

function handleSingleTurnAction(
	con: GameController,
	turnAction: LocalMessageTable[typeof localMessages.GAME_TURN_ACTION],
) {
	const actionType = turnAction.action.type

	let endTurn = false

	const availableActions =
		turnAction.playerEntity === con.game.currentPlayer.entity
			? con.game.state.turn.availableActions
			: con.game.state.turn.opponentAvailableActions

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
			`Players cannot be able to use a blocked action. This may be because the user does not have enough energy for the attack. \n Action:${JSON.stringify(turnAction.action, null, 2)}`,
		)
		switch (actionType) {
			case 'PLAY_HERMIT_CARD':
			case 'PLAY_ITEM_CARD':
			case 'PLAY_EFFECT_CARD':
			case 'PLAY_SINGLE_USE_CARD':
				playCardAction(con.game, turnAction.action)
				break
			case 'SINGLE_USE_ATTACK':
			case 'PRIMARY_ATTACK':
			case 'SECONDARY_ATTACK':
				attackAction(con.game, turnAction.action)
				break
			case 'CHANGE_ACTIVE_HERMIT':
				changeActiveHermitAction(con.game, turnAction.action)
				break
			case 'APPLY_EFFECT':
				applyEffectAction(con.game)
				break
			case 'REMOVE_EFFECT':
				removeEffectAction(con.game)
				break
			case 'PICK_REQUEST':
				pickRequestAction(
					con.game,
					(turnAction.action as PickSlotActionData)?.entity,
				)
				break
			case 'MODAL_REQUEST':
				modalRequestAction(con.game, turnAction?.action?.modalResult)
				break
			case 'END_TURN':
				endTurn = true
				// Turn end actions are not in the battle log, so we log them to stdout manually.
				if (con.game.settings.verboseLogging) {
					console.info(
						`${con.game.logHeader} ${con.game.currentPlayer.playerName} ended their turn.`,
					)
				}
				break
			case 'DELAY':
				con.broadcastState()
				break
			case 'FORFEIT':
				con.game.endInfo.deadPlayerEntities = [turnAction.action.player]
				return 'FORFEIT'
			default:
				// Unknown action type, ignore it completely
				throw new Error(
					`Recieved an action ${actionType} that does not exist. This is impossible.`,
				)
		}
	} catch (e) {
		if (con.game.settings.logErrorsToStderr) {
			console.error(`${con.game.logHeader} ${(e as Error).stack}`.trimStart())
		} else {
			throw e
		}
	}

	// We log endTurn at the start of the turn so the state updates properly.
	if (con.game.settings.verboseLogging && !endTurn) {
		printBoardState(con.game)
	}

	let deadPlayers = []
	deadPlayers.push(...checkDeckedOut(con.game))
	deadPlayers.push(...checkHermitHealth(con.game))
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

function* turnActionsSaga(con: GameController, turnActionChannel: any) {
	const {opponentPlayer, currentPlayer} = con.game

	while (true) {
		if (con.game.settings.showHooksState.enabled) printHooksState(con.game)

		// Available actions code
		const availableEnergy = getAvailableEnergy(con.game)
		let blockedActions: Array<TurnAction> = []
		let availableActions = getAvailableActions(con.game, availableEnergy)

		// Get blocked actions from hooks
		// @TODO this should also not really be a hook anymore
		// @TODO not only that but the blocked actions implementation needs improving, another card needs to be unable to remove another's block
		currentPlayer.hooks.blockedActions.call(blockedActions)

		blockedActions.push(...con.game.settings.blockedActions)

		// Remove blocked actions from the availableActions
		availableActions = availableActions.filter(
			(action) => !blockedActions.includes(action),
		)

		availableActions.push(...con.game.settings.availableActions)

		// Set final actions in state
		let opponentAction: TurnAction = 'WAIT_FOR_TURN'
		if (con.game.state.pickRequests[0]?.player === opponentPlayer.entity) {
			opponentAction = 'PICK_REQUEST'
		} else if (
			con.game.state.modalRequests[0]?.player === opponentPlayer.entity
		) {
			opponentAction = 'MODAL_REQUEST'
		}
		con.game.state.turn.opponentAvailableActions = [opponentAction]
		con.game.state.turn.availableActions = availableActions

		if (
			con.game.settings.autoEndTurn &&
			availableActions.includes('END_TURN') &&
			availableActions.length === 1
		) {
			break
		}

		// Timer calculation
		con.game.state.timer.turnStartTime =
			con.game.state.timer.turnStartTime || Date.now()
		let maxTime = con.game.settings.maxTurnTime * 1000
		let remainingTime =
			con.game.state.timer.turnStartTime + maxTime - Date.now()

		if (availableActions.includes('WAIT_FOR_OPPONENT_ACTION')) {
			con.game.state.timer.opponentActionStartTime =
				con.game.state.timer.opponentActionStartTime || Date.now()
			maxTime = con.game.settings.extraActionTime * 1000
			remainingTime =
				con.game.state.timer.opponentActionStartTime + maxTime - Date.now()
		}

		const graceTime = 1000
		con.game.state.timer.turnRemaining = Math.floor(remainingTime + graceTime)

		con.broadcastState()
		con.game.battleLog.sendLogs()

		const playerAI = getPlayerAI(con.game)
		if (playerAI) {
			yield* fork(function* () {
				yield* call(virtualPlayerActionSaga, con, playerAI)
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
			const currentAttack = con.game.state.turn.currentAttack
			let reset = false

			// First check to see if the opponent had a pick request active
			const currentPickRequest = con.game.state.pickRequests[0]
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
			const currentModalRequest = con.game.state.modalRequests[0]
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
					con.game.removePickRequest()
				} else {
					con.game.removeModalRequest()
				}

				// Reset timer to max time
				con.game.state.timer.turnStartTime = Date.now()
				con.game.state.timer.turnRemaining = con.game.settings.maxTurnTime

				// Execute attack now if there's a current attack
				if (!con.game.hasActiveRequests() && !!currentAttack) {
					// There are no active requests left, and we're in the middle of an attack. Execute it now.
					const turnAction: AttackActionData = {
						type: attackToAttackAction[currentAttack],
					}
					attackAction(con.game, turnAction, false)
				}

				continue
			}

			const hasActiveHermit = con.game.components.exists(
				CardComponent,
				query.card.player(currentPlayer.entity),
				query.card.slot(query.slot.active, query.slot.hermit),
			)
			if (hasActiveHermit) {
				break
			}

			con.game.endInfo.victoryReason = 'timeout-without-hermits'
			con.game.endInfo.deadPlayerEntities = [currentPlayer.entity]
			return 'GAME_END'
		}

		// Run action logic
		const result = handleSingleTurnAction(con, raceResult.turnAction)

		if (result === 'END_TURN') {
			break
		}
		if (result === 'FORFEIT') {
			con.game.endInfo.victoryReason = 'forfeit'
			return 'GAME_END'
		}
	}
}

export function* turnSaga(con: GameController) {
	const {currentPlayer, opponentPlayer} = con.game

	// Reset turn state
	con.game.state.turn.availableActions = []
	con.game.state.turn.completedActions = []
	con.game.state.turn.blockedActions = {}
	con.game.state.turn.currentAttack = null
	currentPlayer.singleUseCardUsed = false
	opponentPlayer.singleUseCardUsed = false

	con.game.state.timer.turnStartTime = Date.now()
	con.game.state.timer.turnRemaining = con.game.settings.maxTurnTime * 1000

	con.game.battleLog.addTurnStartEntry()

	// Call turn start hooks
	currentPlayer.hooks.onTurnStart.call()

	if (con.game.settings.verboseLogging) {
		printBoardState(con.game)
	}

	// Check for dead hermits on turn start
	if (con.game.state.turn.turnNumber > 2) {
		const turnStartDeadPlayers = checkHermitHealth(con.game)
		if (turnStartDeadPlayers.length) {
			con.game.endInfo.victoryReason = turnStartDeadPlayers.every(
				(deadPlayer) => deadPlayer.lives <= 0,
			)
				? 'lives'
				: 'no-hermits-on-board'
			con.game.endInfo.deadPlayerEntities = turnStartDeadPlayers.map(
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

	let result = yield* call(turnActionsSaga, con, turnActionChannel)
	turnActionChannel.close()

	if (result === 'GAME_END') return 'GAME_END'

	// Draw a card from deck when turn ends
	let drawCards = currentPlayer.draw(1)

	// Call turn end hooks
	currentPlayer.hooks.onTurnEnd.call(drawCards)

	// Timeout and clear pick requests
	const pickRequests = con.game.state.pickRequests
	for (let i = 0; i < pickRequests.length; i++) {
		pickRequests[i].onTimeout?.()
	}
	con.game.state.pickRequests = []

	// Timeout and clear modal requests
	const modalRequests = con.game.state.modalRequests
	for (let i = 0; i < modalRequests.length; i++) {
		modalRequests[i].onTimeout()
	}
	con.game.state.modalRequests = []

	const deadPlayers: PlayerComponent[] = checkHermitHealth(con.game)
	if (deadPlayers.length) {
		if (deadPlayers.every((player) => player.lives <= 0)) {
			con.game.endInfo.victoryReason = 'lives'
		} else {
			con.game.endInfo.victoryReason = 'no-hermits-on-board'
		}
		con.game.endInfo.deadPlayerEntities = deadPlayers.map(
			(player) => player.entity,
		)
		return 'GAME_END'
	}

	const deckedOutPlayers: PlayerEntity[] = checkDeckedOut(con.game)
	if (deckedOutPlayers.length) {
		con.game.endInfo.victoryReason = 'decked-out'
		con.game.endInfo.deadPlayerEntities = deckedOutPlayers
		return 'GAME_END'
	}

	// If player has not used his single use card return it to hand
	// otherwise move it to discarded pile
	const singleUseCard = con.game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	)
	if (singleUseCard) {
		if (!currentPlayer.singleUseCardUsed) {
			singleUseCard.attach(
				con.game.components.new(HandSlotComponent, currentPlayer.entity),
			)
		} else {
			singleUseCard.attach(
				con.game.components.new(DiscardSlotComponent, currentPlayer.entity),
			)
		}
	}

	return 'DONE'
}

function checkDeckedOut(game: GameModel) {
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

function* gameSaga(con: GameController) {
	if (con.game.settings.verboseLogging)
		console.info(
			`${con.game.logHeader} ${con.game.opponentPlayer.playerName} was decided to be the first player.`,
		)
	while (true) {
		con.game.state.turn.turnNumber++
		const result = yield* call(turnSaga, con)
		if (result === 'GAME_END') break
	}
	con.game.outcome = figureOutGameResult(con.game)
}

export default gameSaga
