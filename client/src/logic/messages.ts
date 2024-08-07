import {PlayerEntity, SlotEntity} from 'common/entities'
import {Message, MessageTable, messages} from 'common/redux-actions'
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
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {Dispatch} from 'react'
import {useDispatch} from 'react-redux'
import {MODAL_COMPONENTS} from './game/tasks/action-modals-saga'

export const localMessages = messages(
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
	'DECK_NEW',
	'MINECRAFT_NAME_SET',
	'MINECRAFT_NAME_NEW',
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
	'GAME_LOCAL_STATE_RECIEVED',
	'GAME_LOCAL_STATE_SET',
	'GAME_START',
	'GAME_END',
	'GAME_CARD_SELECTED_SET',
	'GAME_MODAL_OPENED_SET',
	'GAME_SLOT_PICKED',
	'GAME_PICK_REQUEST',
	'GAME_FORFEIT',
	'GAME_ATTACK_START',
	'GAME_TURN_ACTION',
	'GAME_END_OVERLAY_SHOW',
	'GAME_END_OVERLAY_HIDE',
	'GAME_COIN_FLIP_SET',
	'GAME_OPPONENT_CONNECTION_SET',
	'GAME_MODAL_REQUEST',
	'GAME_ACTIONS_HERMIT_CHANGE_CONFIRM',
	'CHAT_MESSAGE',
	'CHAT_UPDATE',
	'GAME_TURN_END',
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
	{type: typeof localMessages.SOCKET_CONNECT},
	{type: typeof localMessages.SOCKET_CONNECTING},
	{type: typeof localMessages.SOCKET_DISCONNECT},
	{type: typeof localMessages.SOCKET_CONNECT_ERROR},
	{type: typeof localMessages.LOGIN; name: string},
	{type: typeof localMessages.PLAYER_INFO_SET; player: PlayerInfo},
	{type: typeof localMessages.DISCONNECT; errorMessage?: string},
	{type: typeof localMessages.LOGOUT},
	{type: typeof localMessages.UPDATES_LOAD; updates: Record<string, string[]>},
	{
		type: typeof localMessages.TOAST_OPEN
		open: boolean
		title: string
		description: string
		image?: string
	},
	{type: typeof localMessages.TOAST_CLOSE},
	{type: typeof localMessages.DECK_SET; deck: PlayerDeckT},
	{type: typeof localMessages.DECK_NEW; deck: PlayerDeckT},
	{type: typeof localMessages.MINECRAFT_NAME_SET; name: string},
	{type: typeof localMessages.MINECRAFT_NAME_NEW; name: string},
	{type: typeof localMessages.MATCHMAKING_QUEUE_JOIN},
	{type: typeof localMessages.MATCHMAKING_PRIVATE_GAME_CREATE},
	{type: typeof localMessages.MATCHMAKING_PRIVATE_GAME_JOIN},
	{type: typeof localMessages.MATCHMAKING_CODE_RECIEVED; code: string},
	{type: typeof localMessages.MATCHMAKING_LEAVE},
	{type: typeof localMessages.MATCHMAKING_CLEAR},
	{
		type: typeof localMessages.MATCHMAKING_CODE_SET
		code: string
	},
	{type: typeof localMessages.MATCHMAKING_CODE_INVALID},
	{type: typeof localMessages.MATCHMAKING_WAITING_FOR_PLAYER},
	{
		type: typeof localMessages.GAME_LOCAL_STATE_RECIEVED
		localGameState: LocalGameState
		time: number
	},
	{
		type: typeof localMessages.GAME_LOCAL_STATE_SET
		localGameState: LocalGameState
		time: number
	},
	{type: typeof localMessages.GAME_START},
	{type: typeof localMessages.GAME_END},
	{
		type: typeof localMessages.GAME_CARD_SELECTED_SET
		card: LocalCardInstance | null
	},
	{
		type: typeof localMessages.GAME_MODAL_OPENED_SET
		id: keyof typeof MODAL_COMPONENTS | null
		info?: any
	},
	{
		type: typeof localMessages.GAME_SLOT_PICKED
		slotInfo: SlotInfo
		player: PlayerEntity
		row?: number
		index?: number
	},
	{
		type: typeof localMessages.GAME_PICK_REQUEST
		slot: SlotEntity
	},
	{type: typeof localMessages.GAME_FORFEIT},
	{
		type: typeof localMessages.GAME_ATTACK_START
		attackType: 'single-use' | 'primary' | 'secondary'
		extra?: Record<string, {hermitId: string; type: 'primary' | 'secondary'}>
	},
	{
		type: typeof localMessages.GAME_END_OVERLAY_SHOW
		outcome: GamePlayerEndOutcomeT
		reason: GameEndReasonT
	},
	{
		type: typeof localMessages.GAME_END_OVERLAY_HIDE
	},
	{
		type: typeof localMessages.GAME_COIN_FLIP_SET
		coinFlip: LocalCurrentCoinFlip | null
	},
	{type: typeof localMessages.GAME_OPPONENT_CONNECTION_SET; connected: boolean},
	{
		type: typeof localMessages.GAME_MODAL_REQUEST
		modalResult: LocalModalResult
	},
	{
		type: typeof localMessages.GAME_ACTIONS_HERMIT_CHANGE_CONFIRM
		confirmed: boolean
	},
	{type: typeof localMessages.CHAT_MESSAGE; message: string},
	{type: typeof localMessages.CHAT_UPDATE; messages: Array<ChatMessage>},
	{type: typeof localMessages.GAME_TURN_END},
	{
		type: typeof localMessages.GAME_ACTIONS_ATTACK
		attackType: HermitAttackType
	},
	{
		type: typeof localMessages.GAME_TURN_ACTION
		action: AnyTurnActionData
	},
	{type: typeof localMessages.GAME_ACTIONS_END_TURN},
	{type: typeof localMessages.GAME_UPDATE},
	{type: typeof localMessages.FIREBASE_AUTHED; uuid: string},
	{type: typeof localMessages.FIREBASE_STATS_RESET},
	{
		type: typeof localMessages.FIREBASE_STATS
		w: number
		l: number
		fw: number
		fl: number
		t: number
	},
	{type: typeof localMessages.SETTINGS_SET; key: string; value: any},
	{type: typeof localMessages.SETTINGS_RESET; key: string},
	{type: typeof localMessages.SOUND_PLAY; path: string},
	{type: typeof localMessages.SOUND_SECTION_CHANGE; section: any},
]

/** A message used locally on the client to update global state */
export type LocalMessage = Message<Actions>

/** A message used locally on the client to update global state */
export type LocalMessageTable = MessageTable<Actions>

export const useActionDispatch = useDispatch as () => Dispatch<LocalMessage>
