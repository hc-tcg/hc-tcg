import {
	actionChannel,
	call,
	delay,
	fork,
	put,
	race,
	take,
} from 'typed-redux-saga'
import {SingleUse} from '../cards/base/types'
import {
	CardComponent,
	DiscardSlotComponent,
	HandSlotComponent,
	PlayerComponent,
	SlotComponent,
} from '../components'
import {AIComponent} from '../components/ai-component'
import query from '../components/query'
import {PlayerEntity} from '../entities'
import {GameModel, GameProps} from '../models/game-model'
import {TypeT} from '../types/cards'
import {GameOutcome, TurnAction, TurnActions} from '../types/game-state'
import {AnyTurnActionData, PickSlotActionData} from '../types/turn-action-data'
import {hasEnoughEnergy} from '../utils/attacks'
import {printBoardState, printHooksState} from '../utils/game'

import {Message, MessageTable, messages} from '../redux-messages'
import {assert} from '../utils/assert'
import {
	applyEffectSaga,
	attackSaga,
	changeActiveHermitSaga,
	modalRequestSaga,
	pickRequestSaga,
	playCardSaga,
	removeEffectSaga,
	timeoutSaga,
} from './turn-actions'
import {virtualPlayerActionSaga} from './virtual'

export const gameMessages = messages('game', {
	TURN_ACTION: null,
	GAME_END: null,
})

export type GameMessages = [
	{
		type: typeof gameMessages.TURN_ACTION
		playerEntity: PlayerEntity
		action: AnyTurnActionData
		time: number
	},
	{
		type: typeof gameMessages.GAME_END
		outcome: GameOutcome
	},
]

export type GameMessage = Message<GameMessages>
export type GameMessageTable = MessageTable<GameMessages>

/** The information required to start a game on the client */
export type GameStartupInformation = {
	props: GameProps
	entity?: PlayerEntity
	history: Array<GameMessage>
	timer: {
		turnRemaining: number
		turnStartTime: number
	}
}

export const getTimerForSeconds = (
	game: GameModel,
	seconds: number,
): number => {
	const maxTime = game.settings.maxTurnTime * 1000
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
			if (hermitCard && hermitCard.isHermit()) {
				if (
					hasEnoughEnergy(
						availableEnergy,
						hermitCard.props.primary.cost,
						game.settings.noItemRequirements,
					)
				) {
					actions.push('PRIMARY_ATTACK')
				}
				if (
					hasEnoughEnergy(
						availableEnergy,
						hermitCard.props.secondary.cost,
						game.settings.noItemRequirements,
					)
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

function* turnActionSaga(
	game: GameModel,
	turnAction: GameMessageTable[typeof gameMessages.TURN_ACTION],
	delaySaga: (ms: number) => any,
) {
	const actionType = turnAction.action.type

	let endTurn = false

	const availableActions =
		turnAction.playerEntity === game.currentPlayer.entity
			? game.state.turn.availableActions
			: game.state.turn.opponentAvailableActions

	game.lastTurnActionTime = turnAction.time

	game.handledActions.push(turnAction.time)

	try {
		// We don't check if slot actions are available because the playCardSaga will verify that.
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
			`Players cannot be able to use a blocked action. This may be because the user does not have enough energy for the attack. Action: ${JSON.stringify(turnAction.action, undefined, 2)}`,
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
				console.info(
					`${game.logHeader} ${game.currentPlayer.playerName} ended their turn.`,
				)
				break
			case 'DELAY':
				yield* call(delaySaga, turnAction.action.delay)
				break
			case 'TIMEOUT':
				yield* call(timeoutSaga, game)
				endTurn = true
				console.info(
					`${game.logHeader} ${game.currentPlayer.playerName} ended their turn due to a timeout.`,
				)
				break
			case 'FORFEIT':
				game.endInfo.deadPlayerEntities = [turnAction.playerEntity]
				endTurn = true
				return 'FORFEIT'
				break
			case 'SET_TIMER':
				// I really apoligize about this one.
				game.actionsHandled -= 1
				game.state.timer.turnRemaining = turnAction.action.turnRemaining
				game.state.timer.turnStartTime = turnAction.action.turnStartTime
				break
			default:
				throw new Error(
					`Recieved an action ${actionType} that does not exist. This is impossible.`,
				)
				return
		}
	} catch (e) {
		if (game.settings.logErrorsToStderr) {
			console.error(`${game.logHeader} ${(e as Error).stack}`.trimStart())
		} else {
			throw e
		}
	}

	// We log endTurn at the start of the turn so the state updates properly.
	if (game.settings.logBoardState && !endTurn) {
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

function* turnActionsSaga(
	game: GameModel,
	turnActionChannel: any,
	onTurnActionSaga: (action: any, game: GameModel) => void,
	update?: (game: GameModel) => any,
	delaySaga?: (ms: number) => any,
) {
	const {opponentPlayer, currentPlayer} = game

	try {
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
			} else if (
				game.state.modalRequests[0]?.player === opponentPlayer.entity
			) {
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
			game.state.timer.turnRemaining = remainingTime + graceTime

			// Update the board and clients so it has the correct available actions
			if (update) {
				yield* update(game)
			}

			const playerAI = getPlayerAI(game)
			if (playerAI) yield* fork(virtualPlayerActionSaga, game, playerAI)

			const raceResult = yield* race({
				turnAction: take(turnActionChannel),
				timeout: delay(remainingTime + graceTime),
			}) as any // @NOTE - need to type as any due to typed-redux-saga inferring the wrong return type for action channel

			let turnAction: GameMessageTable[typeof gameMessages.TURN_ACTION] =
				raceResult.turnAction || {
					type: gameMessages.TURN_ACTION,
					playerEntity: game.currentPlayer.entity,
					action: {type: 'TIMEOUT'},
				}

			// Reset coin flips
			currentPlayer.coinFlips = []
			opponentPlayer.coinFlips = []

			// Run action logic
			const result = yield* call(turnActionSaga, game, turnAction, delaySaga)

			game.actionsHandled += 1
			game.setStateHash()
			yield* call(onTurnActionSaga, turnAction, game)

			if (result === 'END_TURN' || result == 'FORFEIT') {
				return result
			}
		}
	} catch (e) {
		if (game.settings.logErrorsToStderr) {
			console.error(`${game.logHeader} ${(e as Error).stack}`.trimStart())
		} else {
			throw e
		}
	}
}

export function* turnSaga(
	game: GameModel,
	turnActionChannel: any,
	onTurnActionSaga: (action: any, game: GameModel) => void,
	update?: (game: GameModel) => any,
) {
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

	if (game.settings.logBoardState) {
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

	let turnActionResult = yield* call(
		turnActionsSaga,
		game,
		turnActionChannel,
		onTurnActionSaga,
		update,
	)

	if (turnActionResult === 'FORFEIT') {
		game.endInfo.victoryReason = 'forfeit'
		return 'GAME_END'
	}

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

function figureOutGameResult(game: GameModel): GameOutcome {
	assert(
		game.endInfo.deadPlayerEntities.length !== 0,
		'Games can not end without at least one dead player',
	)
	assert(
		game.endInfo.victoryReason !== undefined,
		'Games can not end without a reason',
	)

	if (game.endInfo.deadPlayerEntities.length === 2) {
		return 'tie'
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
		winner: alivePlayer,
		victoryReason: game.endInfo.victoryReason,
	}
}

/** Run a game. This saga ends when the game is competle. Send the game result with the gameMessage.GAME_END message. */
export function* runGameSaga(
	props: GameProps,
	sagas: {
		onGameStart?: (game: GameModel) => any
		update?: (game: GameModel) => any
		onTurnAction?: (
			action: GameMessageTable[typeof gameMessages.TURN_ACTION],
			game: GameModel,
		) => any
		delay?: (ms: number) => void
	},
) {
	const game = new GameModel(props)

	const turnActionChannel = yield* actionChannel(gameMessages.TURN_ACTION)

	game.state.turn.turnNumber++
	if (sagas.onGameStart) {
		yield* sagas.onGameStart(game)
	}

	if (sagas.onTurnAction === undefined) {
		sagas.onTurnAction = function* () {}
	}

	while (true) {
		const result = yield* call(
			turnSaga,
			game,
			turnActionChannel,
			sagas.onTurnAction,
			sagas.update,
			sagas.delay || delay,
		)
		if (result === 'GAME_END') break
		game.state.turn.turnNumber++
	}

	turnActionChannel.close()

	// Make sure to show the last game state to the client.
	if (sagas.update) {
		yield* sagas.update(game)
	}

	yield* put<GameMessage>({
		type: gameMessages.GAME_END,
		outcome: figureOutGameResult(game),
	})
}

export default runGameSaga
