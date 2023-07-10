import {LocalGameState} from 'common/types/game-state'
import {CardT, GameEndOutcomeT, GameEndReasonT, CurrentCoinFlipT} from 'common/types/game-state'
import {PickProcessT, PickResultT, PickedSlotT} from 'common/types/pick-process'
import {MessageInfoT} from 'common/types/chat'

export const gameState = (localGameState: LocalGameState) => ({
	type: 'GAME_STATE' as const,
	payload: {
		localGameState,
		time: Date.now(),
	},
})

export const localGameState = (localGameState: LocalGameState) => ({
	type: 'LOCAL_GAME_STATE' as const,
	payload: {
		localGameState,
		time: Date.now(),
	},
})

export const gameStart = () => ({
	type: 'GAME_START' as const,
})

export const gameEnd = () => ({
	type: 'GAME_END' as const,
})

export const setSelectedCard = (card: CardT | null) => ({
	type: 'SET_SELECTED_CARD' as const,
	payload: card,
})

export const setOpenedModal = (id: string | null, info: any = null) => ({
	type: 'SET_OPENED_MODAL' as const,
	payload: id === null ? null : {id, info},
})

export const setPickProcess = (pickProcess: PickProcessT | null) => ({
	type: 'SET_PICK_PROCESS' as const,
	payload: pickProcess,
})

export const updatePickProcess = (payload: {
	currentReq?: number
	amount?: number
	pickedSlots?: Array<PickedSlotT>
}) => ({
	type: 'UPDATE_PICK_PROCESS' as const,
	payload,
})

export const slotPicked = (pickInfo: PickedSlotT) => ({
	type: 'SLOT_PICKED' as const,
	payload: pickInfo,
})

export const forfeit = () => ({
	type: 'FORFEIT' as const,
})

type ExtraItemT = {hermitId: string; type: 'primary' | 'secondary'}

export const startAttack = (
	type: 'zero' | 'primary' | 'secondary',
	extra?: Record<string, ExtraItemT>
) => ({
	type: 'START_ATTACK' as const,
	payload: {type, extra},
})

export const showEndGameOverlay = (outcome: GameEndOutcomeT, reason: GameEndReasonT = null) => ({
	type: 'SHOW_END_GAME_OVERLAY' as const,
	payload: {
		outcome,
		reason,
	},
})

export const setCoinFlip = (payload: CurrentCoinFlipT | null) => ({
	type: 'SET_COIN_FLIP',
	payload,
})

export const setOpponentConnection = (payload: boolean) => ({
	type: 'SET_OPPONENT_CONNECTION',
	payload,
})

// ---

export const followUp = (payload: any) => ({
	type: 'FOLLOW_UP' as const,
	payload,
})

export const applyEffect = (payload: any) => ({
	type: 'APPLY_EFFECT' as const,
	payload,
})

export const removeEffect = () => ({
	type: 'REMOVE_EFFECT' as const,
})

export const changeActiveHermit = (payload: any) => ({
	type: 'CHANGE_ACTIVE_HERMIT' as const,
	payload,
})

export const playCard = (payload: any) => ({
	type: 'PLAY_CARD' as const,
	payload,
})

export const endTurn = () => ({
	type: 'END_TURN' as const,
})

export const attack = (
	type: 'zero' | 'primary' | 'secondary',
	pickResults: Record<string, Array<PickResultT>>,
	extra?: Record<string, any>
) => ({
	type: 'ATTACK' as const,
	payload: {type, pickResults, extra},
})

export const chatMessage = (message: string) => ({
	type: 'CHAT_MESSAGE',
	payload: message,
})

export const chatUpdate = (messages: Array<MessageInfoT>) => ({
	type: 'CHAT_UPDATE',
	payload: messages,
})
