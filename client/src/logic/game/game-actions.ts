import {PlayerEntity} from 'common/entities'
import {
	LocalCurrentCoinFlip,
	LocalGameState,
	Message as ChatMessage,
} from 'common/types/game-state'
import {GamePlayerEndOutcomeT, GameEndReasonT} from 'common/types/game-state'
import {
	LocalCardInstance,
	LocalModalResult,
	SlotInfo,
} from 'common/types/server-requests'
import {messages, Message} from 'common/redux-actions'

export const gameActions = messages(
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

export type GameActions = [
	{
		type: typeof gameActions.GAME_STATE_RECIEVED
		localGameState: LocalGameState
		time: number
	},
	{
		type: typeof gameActions.LOCAL_GAME_STATE
		localGameState: LocalGameState
		time: number
	},
	{type: typeof gameActions.GAME_START},
	{type: typeof gameActions.GAME_END},
	{type: typeof gameActions.SET_SELECTED_CARD; card: LocalCardInstance | null},
	{type: typeof gameActions.SET_OPENED_MODAL; id: string | null; info?: any},
	{
		type: typeof gameActions.SLOT_PICKED
		slotInfo: SlotInfo
		player: PlayerEntity
		row?: number
		index?: number
	},
	{type: typeof gameActions.FORFEIT},
	{
		type: typeof gameActions.START_ATTACK
		attackType: 'single-use' | 'primary' | 'secondary'
		extra?: Record<string, {hermitId: string; type: 'primary' | 'secondary'}>
	},
	{
		type: typeof gameActions.SHOW_END_GAME_OVERLAY
		outcome: GamePlayerEndOutcomeT
		reason?: GameEndReasonT
	},
	{type: typeof gameActions.SET_COIN_FLIP; coinFlip: LocalCurrentCoinFlip},
	{type: typeof gameActions.SET_OPPONENT_CONNECTION; connected: boolean},
	{type: typeof gameActions.MODAL_REQUEST; modalResult: LocalModalResult},
	{type: typeof gameActions.APPLY_EFFECT; payload: any},
	{type: typeof gameActions.REMOVE_EFFECT},
	{type: typeof gameActions.END_TURN},
	{type: typeof gameActions.CHAT_MESSAGE; message: string},
	{type: typeof gameActions.CHAT_UPDATE; messages: Array<ChatMessage>},
	{type: typeof gameActions.ATTACK_ACTION},
	{type: typeof gameActions.END_TURN_ACTION},
	{type: typeof gameActions.UPDATE_GAME},
]

export type GameMessage = Message<GameActions>
