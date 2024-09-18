import {PlayerEntity} from 'common/entities'
import {PlayerId} from 'common/models/player-model'
import {Message, MessageTable, messages} from 'common/redux-messages'
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
	PlayerInfo,
	SlotInfo,
} from 'common/types/server-requests'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {Dispatch} from 'react'
import {useDispatch} from 'react-redux'
import {MODAL_COMPONENTS} from './game/tasks/action-modals-saga'
import {
	LocalSetting,
	LocalSettings,
} from './local-settings/local-settings-reducer'

export const localMessages = messages({
	SOCKET_CONNECTING: null,
	SOCKET_CONNECT: null,
	SOCKET_DISCONNECT: null,
	SOCKET_CONNECT_ERROR: null,
	LOGIN: null,
	PLAYER_SESSION_SET: null,
	PLAYER_INFO_SET: null,
	DISCONNECT: null,
	LOGOUT: null,
	UPDATES_LOAD: null,
	TOAST_OPEN: null,
	TOAST_CLOSE: null,
	DECK_SET: null,
	DECK_NEW: null,
	MINECRAFT_NAME_SET: null,
	MINECRAFT_NAME_NEW: null,
	MATCHMAKING_QUEUE_JOIN: null,
	MATCHMAKING_QUEUE_JOIN_FAILURE: null,
	MATCHMAKING_PRIVATE_GAME_CREATE: null,
	MATCHMAKING_PRIVATE_GAME_JOIN: null,
	MATCHMAKING_CODE_RECIEVED: null,
	MATCHMAKING_LEAVE: null,
	MATCHMAKING_CLEAR: null,
	MATCHMAKING_CODE_SET: null,
	MATCHMAKING_CODE_INVALID: null,
	MATCHMAKING_WAITING_FOR_PLAYER: null,
	GAME_LOCAL_STATE_RECIEVED: null,
	GAME_LOCAL_STATE_SET: null,
	GAME_START: null,
	GAME_END: null,
	GAME_CARD_SELECTED_SET: null,
	GAME_MODAL_OPENED_SET: null,
	GAME_SLOT_PICKED: null,
	GAME_FORFEIT: null,
	GAME_ATTACK_START: null,
	GAME_TURN_ACTION: null,
	GAME_END_OVERLAY_SHOW: null,
	GAME_END_OVERLAY_HIDE: null,
	GAME_COIN_FLIP_SET: null,
	GAME_OPPONENT_CONNECTION_SET: null,
	GAME_ACTIONS_HERMIT_CHANGE_CONFIRM: null,
	CHAT_MESSAGE: null,
	CHAT_UPDATE: null,
	GAME_TURN_END: null,
	GAME_ACTIONS_ATTACK: null,
	GAME_ACTIONS_END_TURN: null,
	GAME_UPDATE: null,
	FIREBASE_AUTHED: null,
	FIREBASE_STATS_RESET: null,
	FIREBASE_STATS: null,
	SETTINGS_SET: null,
	SETTINGS_RESET: null,
	ALL_SETTINGS_RESET: null,
	SOUND_PLAY: null,
	SOUND_SECTION_CHANGE: null,
})

type Messages = [
	{type: typeof localMessages.SOCKET_CONNECT},
	{type: typeof localMessages.SOCKET_CONNECTING},
	{type: typeof localMessages.SOCKET_DISCONNECT},
	{type: typeof localMessages.SOCKET_CONNECT_ERROR},
	{type: typeof localMessages.LOGIN; name: string},
	{
		type: typeof localMessages.PLAYER_SESSION_SET
		player: {
			playerName: string
			censoredPlayerName: string
			playerId: PlayerId
			playerSecret: string
		}
	},
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
	{type: typeof localMessages.GAME_FORFEIT},
	{
		type: typeof localMessages.GAME_ATTACK_START
		attackType: 'single-use' | 'primary' | 'secondary'
		extra?: Record<string, {hermitId: string; type: 'primary' | 'secondary'}>
	},
	{
		type: typeof localMessages.GAME_END_OVERLAY_SHOW
		outcome: GamePlayerEndOutcomeT
		reason?: GameEndReasonT
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
	{type: typeof localMessages.GAME_UPDATE; gameState: LocalGameState | null},
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
	{type: typeof localMessages.SETTINGS_SET; setting: LocalSetting},
	{type: typeof localMessages.SETTINGS_RESET; key: keyof LocalSettings},
	{type: typeof localMessages.ALL_SETTINGS_RESET},
	{type: typeof localMessages.SOUND_PLAY; path: string},
	{type: typeof localMessages.SOUND_SECTION_CHANGE; section: any},
]

/** A message used locally on the client to update global state */
export type LocalMessage = Message<Messages>

/** A message used locally on the client to update global state */
export type LocalMessageTable = MessageTable<Messages>

export const useMessageDispatch = useDispatch as () => Dispatch<LocalMessage>
