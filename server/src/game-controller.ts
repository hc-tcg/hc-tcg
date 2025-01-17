import {
	GameModel,
	GameSettings,
	gameSettingsFromEnv,
} from 'common/models/game-model'
import {
	ServerMessage,
	serverMessages,
} from 'common/socket-messages/server-messages'
import {Message} from 'common/types/game-state'
import {PlayerSetupDefs} from 'common/utils/state-gen'
import {broadcast} from './utils/comm'
import {getLocalGameState} from 'utils/state-gen'

export type GameControllerProps = {
	gameCode?: string
	spectatorCode?: string
	apiSecret?: string
	randomizeOrder?: boolean
	randomSeed?: any
	settings?: GameSettings
}

/** An object that contains the HC TCG game and infromation related to the game, such as chat messages */
export class GameController {
	createdTime: number
	id: string
	gameCode: string | null
	spectatorCode: string | null
	apiSecret: string | null

	game: GameModel
	chat: Array<Message>
	task: any

	constructor(
		player1: PlayerSetupDefs,
		player2: PlayerSetupDefs,
		props: GameControllerProps,
	) {
		this.chat = []

		this.game = new GameModel(
			props.randomSeed || GameModel.newGameSeed(),
			player1,
			player2,
			props.settings || gameSettingsFromEnv(),
			{
				publishBattleLog: (logs) => this.publishBattleLog(logs),
				randomizeOrder: props.randomizeOrder ?? true,
			},
		)

		this.createdTime = Date.now()
		this.id = 'game-controller_' + Math.random().toString()
		this.gameCode = props.gameCode || null
		this.spectatorCode = props.spectatorCode || null
		this.apiSecret = props.apiSecret || null
		this.task = null
	}

	private publishBattleLog(logs: Array<Message>) {
		this.chat.push(...logs)
		this.chatUpdate()
	}

	/** Send new chat messages to the viewers */
	public chatUpdate() {
		broadcast(this.game.getPlayers(), {
			type: serverMessages.CHAT_UPDATE,
			messages: this.chat,
		})
	}

	public broadcastState() {
		this.game.viewers.forEach((viewer) => {
			const localGameState = getLocalGameState(this.game, viewer)

			broadcast([viewer.player], {
				type: serverMessages.GAME_STATE,
				localGameState,
			})
		})

		this.game.voiceLineQueue = []
	}

	public broadcastToViewers(payload: ServerMessage) {
		broadcast(
			this.game.viewers.map((viewer) => viewer.player),
			payload,
		)
	}
}
