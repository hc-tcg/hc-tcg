import {PlayerEntity} from 'common/entities'
import {Message, messages} from 'common/redux-actions'
import {PlayerDeckT} from 'common/types/deck'
import {
	GameEndReasonT,
	GamePlayerEndOutcomeT,
	LocalCurrentCoinFlip,
	LocalGameState,
} from 'common/types/game-state'
import {Message as ChatMessage} from 'common/types/game-state'
import {
	LocalCardInstance,
	LocalModalResult,
	PlayerInfo,
	SlotInfo,
} from 'common/types/server-requests'

export const actions = messages(
	'SOCKET_CONNECTING',
	'SOCKET_CONNECT',
	'SOCKET_DISCONNECT',
	'SOCKET_CONNECT_ERROR',
	'LOGIN',
	'PLAYER_INFO_SET',
	'DISCONNECT',
	'LOGOUT',
	'UPDATES_LOAD',
	'TOAST_OPEN',
	'TOAST_CLOSE',
	'UPDATE_DECK',
	'UPDATE_MINECRAFT_NAME',
	'MATCHMAKING_JOIN_QUEUE',
	'MATCHMAKING_JOIN_QUEUE_FAILURE',
	'MATCHMAKING_PRIVATE_GAME_CREATE',
	'MATCHMAKING_PRIVATE_GAME_JOIN',
	'MATCHMAKING_CODE_RECIEVED',
	'MATCHMAKING_LEAVE',
	'MATCHMAKING_CLEAR',
	'MATCHMAKING_CODE_SET',
	'MATCHMAKING_INVALID_CODE',
	'MATCHMAKING_WAITING_FOR_PLAYER',
	'GAME_STATE_RECIEVED',
	'GAME_LOCAL_STATE',
	'GAME_START',
	'GAME_END',
	'GAME_SET_SELECTED_CARD',
	'GAME_SET_OPENED_MODAL',
	'GAME_SLOT_PICKED',
	'GAME_FORFEIT',
	'GAME_ATTACK_START',
	'GAME_END_OVERLAY_SHOW',
	'GAME_COIN_FLIP_SET',
	'GAME_OPPONENT_CONNECTION_SET',
	'GAME_MODAL_REQUEST',
	'GAME_EFFECT_APPLY',
	'GAME_EFFECT_REMOVE',
	'GAME_TURN_END',
	'CHAT_MESSAGE',
	'CHAT_UPDATE',
	'ATTACK_ACTION',
	'END_TURN_ACTION',
	'UPDATE_GAME',
	'FIREBASE_AUTHED',
	'FIREBASE_STATS_RESET',
	'FIREBASE_STATS',
	'SET_SETTING',
	'RESET_SETTINGS',
	'SOUND_PLAY',
	'SOUND_SECTION_CHANGE',
)

export type Actions = [
	{type: typeof actions.SOCKET_CONNECT},
	{type: typeof actions.SOCKET_CONNECTING},
	{type: typeof actions.SOCKET_DISCONNECT},
	{type: typeof actions.SOCKET_CONNECT_ERROR},
	{type: typeof actions.LOGIN; name: string},
	{type: typeof actions.PLAYER_INFO_SET; player: PlayerInfo},
	{type: typeof actions.DISCONNECT; errorMessage: string},
	{type: typeof actions.LOGOUT},
	{type: typeof actions.UPDATES_LOAD; updates: Record<string, string[]>},
	{
		type: typeof actions.TOAST_OPEN
		open: boolean
		title: string
		description: string
		image: string
	},
	{type: typeof actions.TOAST_CLOSE},
	{type: typeof actions.UPDATE_DECK; deck: PlayerDeckT},
	{type: typeof actions.UPDATE_MINECRAFT_NAME; name: string},
	{type: typeof actions.MATCHMAKING_JOIN_QUEUE},
	{type: typeof actions.MATCHMAKING_PRIVATE_GAME_CREATE},
	{type: typeof actions.MATCHMAKING_PRIVATE_GAME_JOIN},
	{type: typeof actions.MATCHMAKING_CODE_RECIEVED; code: string},
	{type: typeof actions.MATCHMAKING_LEAVE},
	{type: typeof actions.MATCHMAKING_CLEAR},
	{
		type: typeof actions.MATCHMAKING_CODE_SET
		code: string
	},
	{type: typeof actions.MATCHMAKING_INVALID_CODE},
	{type: typeof actions.MATCHMAKING_WAITING_FOR_PLAYER},
	{
		type: typeof actions.GAME_STATE_RECIEVED
		localGameState: LocalGameState
		time: number
	},
	{
		type: typeof actions.GAME_LOCAL_STATE
		localGameState: LocalGameState
		time: number
	},
	{type: typeof actions.GAME_START},
	{type: typeof actions.GAME_END},
	{type: typeof actions.GAME_SET_SELECTED_CARD; card: LocalCardInstance | null},
	{type: typeof actions.GAME_SET_OPENED_MODAL; id: string; info?: any},
	{
		type: typeof actions.GAME_SLOT_PICKED
		slotInfo: SlotInfo
		player: PlayerEntity
		row?: number
		index?: number
	},
	{type: typeof actions.GAME_FORFEIT},
	{
		type: typeof actions.GAME_ATTACK_START
		attackType: 'single-use' | 'primary' | 'secondary'
		extra?: Record<string, {hermitId: string; type: 'primary' | 'secondary'}>
	},
	{
		type: typeof actions.GAME_END_OVERLAY_SHOW
		outcome: GamePlayerEndOutcomeT
		reason: GameEndReasonT
	},
	{type: typeof actions.GAME_COIN_FLIP_SET; coinFlip: LocalCurrentCoinFlip},
	{type: typeof actions.GAME_OPPONENT_CONNECTION_SET; connected: boolean},
	{type: typeof actions.GAME_MODAL_REQUEST; modalResult: LocalModalResult},
	{type: typeof actions.GAME_EFFECT_APPLY; payload: any},
	{type: typeof actions.GAME_EFFECT_REMOVE},
	{type: typeof actions.GAME_TURN_END},
	{type: typeof actions.CHAT_MESSAGE; message: string},
	{type: typeof actions.CHAT_UPDATE; messages: Array<ChatMessage>},
	{type: typeof actions.ATTACK_ACTION},
	{type: typeof actions.END_TURN_ACTION},
	{type: typeof actions.UPDATE_GAME},
	{type: typeof actions.FIREBASE_AUTHED; uuid: string},
	{type: typeof actions.FIREBASE_STATS_RESET},
	{
		type: typeof actions.FIREBASE_STATS
		w: number
		l: number
		fw: number
		fl: number
		t: number
	},
	{type: typeof actions.SET_SETTING; key: string; value: any},
	{type: typeof actions.RESET_SETTINGS; key: string},
	{type: typeof actions.SOUND_PLAY; path: string},
	{type: typeof actions.SOUND_SECTION_CHANGE; payload: any},
]

export type Action = Message<Actions>
