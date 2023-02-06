import {GameState} from 'types/game-state'
import {CardT} from 'types/game-state'
import {PickProcessT, PickedCardT} from 'types/pick-process'

export const gameState = (gameState: GameState) => ({
	type: 'GAME_STATE',
	payload: gameState,
})

export const gameStart = () => ({
	type: 'GAME_START',
})

export const gameEnd = () => ({
	type: 'GAME_END',
})

export const setSelectedCard = (card: CardT | null) => ({
	type: 'SET_SELECTED_CARD',
	payload: card,
})

export const setOpenedModalId = (modalId: string | null) => ({
	type: 'SET_OPENED_MODAL_ID',
	payload: modalId,
})

export const setPickProcess = (pickProcess: PickProcessT | null) => ({
	type: 'SET_PICK_PROCESS',
	payload: pickProcess,
})

export const updatePickProcess = (pickedCards: Array<PickedCardT>) => ({
	type: 'UPDATE_PICK_PROCESS',
	payload: pickedCards,
})

export const slotPicked = (pickInfo: PickedCardT) => ({
	type: 'SLOT_PICKED',
	payload: pickInfo,
})

export const forfeit = () => ({
	type: 'FORFEIT',
})

// ---

export const followUp = (payload: any) => ({
	type: 'FOLLOW_UP',
	payload,
})

export const applyEffect = (payload: any) => ({
	type: 'APPLY_EFFECT',
	payload,
})

export const changeActiveHermit = (payload: any) => ({
	type: 'CHANGE_ACTIVE_HERMIT',
	payload,
})

export const playCard = (payload: any) => ({
	type: 'PLAY_CARD',
	payload,
})

export const endTurn = () => ({
	type: 'END_TURN',
})

export const attack = (type: 'zero' | 'primary' | 'secondary') => ({
	type: 'ATTACK',
	payload: {type},
})
