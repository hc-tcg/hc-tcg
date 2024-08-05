import {PlayerEntity} from 'common/entities'
import {
	LocalCurrentCoinFlip,
	LocalGameState,
	Message,
} from 'common/types/game-state'
import {GamePlayerEndOutcomeT, GameEndReasonT} from 'common/types/game-state'
import {
	LocalCardInstance,
	LocalModalResult,
	SlotInfo,
} from 'common/types/server-requests'
import {Action, actions} from 'common/redux-actions'

export const gameActions = actions(
	'GAME_STATE_RECIEVED',
	'LOCAL_GAME_STATE',
	'GAME_START',
	'GAME_END',
	'SET_SELECTED_CARD',
	'SET_OPENED_MODAL',
	'SLOT_PICKED',
	'FORFEIT',
	'START_ATTACK',
	'SHOW_END_GAME_OVERLAY',
	'SET_COIN_FLIP',
	'SET_OPPONENT_CONNECTION',
	'MODAL_REQUEST',
	'APPLY_EFFECT',
	'REMOVE_EFFECT',
	'END_TURN',
	'CHAT_MESSAGE',
	'CHAT_UPDATE',
	'ATTACK_ACTION',
	'END_TURN_ACTION',
	'UPDATE_GAME',
)

export type GameAction = Action<
	| typeof gameStateReceived
	| typeof localGameState
	| typeof gameStart
	| typeof gameEnd
	| typeof setSelectedCard
	| typeof setOpenedModal
	| typeof setSelectedCard
	| typeof setOpenedModal
	| typeof slotPicked
	| typeof forfeit
	| typeof startAttack
	| typeof showEndGameOverlay
	| typeof setCoinFlip
	| typeof setOpponentConnection
	| typeof setOpenedModal
	| typeof applyEffect
	| typeof removeEffect
	| typeof endTurn
	| typeof chatMessage
	| typeof chatUpdate
	| typeof attackAction
	| typeof endTurnAction
	| typeof updateGame
>

export const gameStateReceived = (localGameState: LocalGameState) => ({
	type: gameActions.GAME_STATE_RECIEVED,
	payload: {
		localGameState,
		time: Date.now(),
	},
})

export const localGameState = (localGameState: LocalGameState) => ({
	type: gameActions.LOCAL_GAME_STATE,
	payload: {
		localGameState,
		time: Date.now(),
	},
})

export const gameStart = () => ({
	type: gameActions.GAME_START,
})

export const gameEnd = () => ({
	type: gameActions.GAME_END,
})

export const setSelectedCard = (card: LocalCardInstance | null) => ({
	type: gameActions.SET_SELECTED_CARD,
	payload: card,
})

export const setOpenedModal = (id: string | null, info: any = null) => ({
	type: gameActions.SET_OPENED_MODAL,
	payload: id === null ? null : {id, info},
})

export const slotPicked = (
	slotInfo: SlotInfo,
	player: PlayerEntity,
	row?: number,
	index?: number,
) => ({
	type: gameActions.SLOT_PICKED,
	payload: {
		slot: slotInfo,
		player: player,
		row: row,
		index: index,
	},
})

export const forfeit = () => ({
	type: gameActions.FORFEIT,
})

type ExtraItemT = {hermitId: string; type: 'primary' | 'secondary'}

export const startAttack = (
	type: 'single-use' | 'primary' | 'secondary',
	extra?: Record<string, ExtraItemT>,
) => ({
	type: gameActions.START_ATTACK,
	payload: {type, extra},
})

export const showEndGameOverlay = (
	outcome: GamePlayerEndOutcomeT,
	reason: GameEndReasonT = null,
) => ({
	type: gameActions.SHOW_END_GAME_OVERLAY,
	payload: {
		outcome,
		reason,
	},
})

export const setCoinFlip = (payload: LocalCurrentCoinFlip | null) => ({
	type: gameActions.SET_COIN_FLIP,
	payload,
})

export const setOpponentConnection = (payload: boolean) => ({
	type: gameActions.SET_OPPONENT_CONNECTION,
	payload,
})

// ---

export const modalRequest = (payload: {modalResult: LocalModalResult}) => ({
	type: gameActions.MODAL_REQUEST,
	payload,
})

export const applyEffect = (payload: any) => ({
	type: gameActions.APPLY_EFFECT,
	payload,
})

export const removeEffect = () => ({
	type: gameActions.REMOVE_EFFECT,
})

export const endTurn = () => ({
	type: gameActions.END_TURN,
})

export const chatMessage = (message: string) => ({
	type: gameActions.CHAT_MESSAGE,
	payload: message,
})

export const chatUpdate = (messages: Array<Message>) => ({
	type: gameActions.CHAT_UPDATE,
	payload: messages,
})

export const attackAction = () => ({
	type: gameActions.ATTACK_ACTION,
})

export const endTurnAction = () => ({
	type: gameActions.END_TURN_ACTION,
})

export const updateGame = () => ({
	type: gameActions.UPDATE_GAME,
})
