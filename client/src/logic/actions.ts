import {PlayerEntity, SlotEntity} from 'common/entities'
import {Message, messages} from 'common/redux-actions'
import {HermitAttackType} from 'common/types/attack'
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
import {Dispatch} from 'react'
import {useDispatch} from 'react-redux'
import {put} from 'typed-redux-saga'

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
	'DECK_SET',
	'MINECRAFT_NAME_SET',
	'MATCHMAKING_QUEUE_JOIN',
	'MATCHMAKING_QUEUE_JOIN_FAILURE',
	'MATCHMAKING_PRIVATE_GAME_CREATE',
	'MATCHMAKING_PRIVATE_GAME_JOIN',
	'MATCHMAKING_CODE_RECIEVED',
	'MATCHMAKING_LEAVE',
	'MATCHMAKING_CLEAR',
	'MATCHMAKING_CODE_SET',
	'MATCHMAKING_CODE_INVALID',
	'MATCHMAKING_WAITING_FOR_PLAYER',
	'GAME_STATE_RECIEVED',
	'GAME_LOCAL_STATE',
	'GAME_START',
	'GAME_END',
	'GAME_CARD_SELECTED_SET',
	'GAME_MODAL_OPENED_SET',
	'GAME_SLOT_PICKED',
	'GAME_PICK_REQUEST',
	'GAME_FORFEIT',
	'GAME_ATTACK_START',
	'GAME_END_OVERLAY_SHOW',
	'GAME_END_OVERLAY_HIDE',
	'GAME_COIN_FLIP_SET',
	'GAME_OPPONENT_CONNECTION_SET',
	'GAME_MODAL_REQUEST',
	'GAME_EFFECT_APPLY',
	'GAME_EFFECT_REMOVE',
	'GAME_TURN_END',
	'CHAT_MESSAGE',
	'CHAT_UPDATE',
	'GAME_ACTIONS_ATTACK',
	'GAME_ACTIONS_END_TURN',
	'GAME_UPDATE',
	'FIREBASE_AUTHED',
	'FIREBASE_STATS_RESET',
	'FIREBASE_STATS',
	'SETTINGS_SET',
	'SETTINGS_RESET',
	'SOUND_PLAY',
	'SOUND_SECTION_CHANGE',
)

type Actions = [
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
	{type: typeof actions.DECK_SET; deck: PlayerDeckT},
	{type: typeof actions.MINECRAFT_NAME_SET; name: string},
	{type: typeof actions.MATCHMAKING_QUEUE_JOIN},
	{type: typeof actions.MATCHMAKING_PRIVATE_GAME_CREATE},
	{type: typeof actions.MATCHMAKING_PRIVATE_GAME_JOIN},
	{type: typeof actions.MATCHMAKING_CODE_RECIEVED; code: string},
	{type: typeof actions.MATCHMAKING_LEAVE},
	{type: typeof actions.MATCHMAKING_CLEAR},
	{
		type: typeof actions.MATCHMAKING_CODE_SET
		code: string
	},
	{type: typeof actions.MATCHMAKING_CODE_INVALID},
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
	{type: typeof actions.GAME_CARD_SELECTED_SET; card: LocalCardInstance | null},
	{type: typeof actions.GAME_MODAL_OPENED_SET; id: string | null; info?: any},
	{
		type: typeof actions.GAME_SLOT_PICKED
		slotInfo: SlotInfo
		player: PlayerEntity
		row?: number
		index?: number
	},
	{
		type: typeof actions.GAME_PICK_REQUEST
		slot: SlotEntity
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
	{
		type: typeof actions.GAME_END_OVERLAY_HIDE
	},
	{type: typeof actions.GAME_COIN_FLIP_SET; coinFlip: LocalCurrentCoinFlip | null},
	{type: typeof actions.GAME_OPPONENT_CONNECTION_SET; connected: boolean},
	{type: typeof actions.GAME_MODAL_REQUEST; modalResult: LocalModalResult},
	{type: typeof actions.GAME_EFFECT_APPLY; payload: any},
	{type: typeof actions.GAME_EFFECT_REMOVE},
	{type: typeof actions.GAME_TURN_END},
	{type: typeof actions.CHAT_MESSAGE; message: string},
	{type: typeof actions.CHAT_UPDATE; messages: Array<ChatMessage>},
	{type: typeof actions.GAME_ACTIONS_ATTACK; attackType: HermitAttackType},
	{type: typeof actions.GAME_ACTIONS_END_TURN},
	{type: typeof actions.GAME_UPDATE},
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
	{type: typeof actions.SETTINGS_SET; key: string; value: any},
	{type: typeof actions.SETTINGS_RESET; key: string},
	{type: typeof actions.SOUND_PLAY; path: string},
	{type: typeof actions.SOUND_SECTION_CHANGE; section: any},
]

export type Action = Message<Actions>

export function useActionDispatch(): Dispatch<Action> {
	return useDispatch()
}

export function* putAction(action: Action): any {
	return yield* put(action)
}
