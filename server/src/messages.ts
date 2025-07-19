import {Appearance} from 'common/cosmetics/types'
import {PlayerEntity} from 'common/entities'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {Message, MessageTable, messages} from 'common/redux-messages'
import {Deck} from 'common/types/deck'
import {AnyTurnActionData} from 'common/types/turn-action-data'

export const localMessages = messages('serverLocalMessages', {
	CLIENT_CONNECTED: null,
	CLIENT_DISCONNECTED: null,
	PLAYER_CONNECTED: null,
	PLAYER_DISCONNECTED: null,
	PLAYER_RECONNECTED: null,
	PLAYER_REMOVED: null,
	GAME_TURN_ACTION: null,
})

type Messages = [
	{
		type: typeof localMessages.CLIENT_CONNECTED
		playerId: PlayerId
		playerUuid: string
		playerName: string
		playerSecret: string
		minecraftName: string
		deck: Deck
		appearance: Appearance
		socket: any
	},
	{type: typeof localMessages.CLIENT_DISCONNECTED; socket: any},
	{type: typeof localMessages.PLAYER_CONNECTED; player: PlayerModel},
	{type: typeof localMessages.PLAYER_DISCONNECTED; player: PlayerModel},
	{type: typeof localMessages.PLAYER_RECONNECTED; player: PlayerModel},
	{type: typeof localMessages.PLAYER_REMOVED; player: PlayerModel},
	{
		type: typeof localMessages.GAME_TURN_ACTION
		playerEntity: PlayerEntity
		action: AnyTurnActionData
		game: string
	},
]

export type LocalMessage = Message<Messages>

/** A message used locally on the client to update global state */
export type LocalMessageTable = MessageTable<Messages>
