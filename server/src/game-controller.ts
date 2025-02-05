import {PlayerEntity} from 'common/entities'
import {
	GameModel,
	GameSettings,
	gameSettingsFromEnv,
} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {
	ServerMessage,
	serverMessages,
} from 'common/socket-messages/server-messages'
import {CurrentCoinFlip, Message} from 'common/types/game-state'
import {PlayerSetupDefs} from 'common/utils/state-gen'
import {broadcast} from './utils/comm'
import {getLocalGameState} from './utils/state-gen'

export type GameControllerProps = {
	gameCode?: string
	spectatorCode?: string
	apiSecret?: string
	randomizeOrder?: boolean
	randomSeed?: any
	settings?: GameSettings
}

type GameViewerProps = {
	spectator: boolean
	playerOnLeft: PlayerEntity
	player: PlayerModel
}

export class GameViewer {
	id: string
	game: GameModel
	spectator: boolean
	playerOnLeftEntity: PlayerEntity
	player: PlayerModel

	public constructor(game: GameModel, props: GameViewerProps) {
		this.id = `${Math.random()}`
		this.game = game
		this.spectator = props.spectator
		this.playerOnLeftEntity = props.playerOnLeft
		this.player = props.player
	}

	get playerOnLeft() {
		return this.game.components.getOrError(this.playerOnLeftEntity)
	}

	get playerOnRight() {
		return this.playerOnLeft.opponentPlayer
	}
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
	viewers: Array<GameViewer>

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
				publishBattleLog: (logs, timeout) =>
					this.publishBattleLog(logs, timeout),
				randomizeOrder: props.randomizeOrder ?? true,
			},
		)

		this.createdTime = Date.now()
		this.id = 'game-controller_' + Math.random().toString()
		this.gameCode = props.gameCode || null
		this.spectatorCode = props.spectatorCode || null
		this.apiSecret = props.apiSecret || null
		this.task = null
		this.viewers = []
	}

	public addViewer(viewer: GameViewerProps) {
		let v = new GameViewer(this.game, viewer)
		this.viewers.push(v)
		return v
	}

	public removeViewer(viewer: GameViewer) {
		this.viewers = this.viewers.filter((v) => v.id !== viewer.id)
	}

	public getPlayers() {
		return this.viewers.map((viewer) => viewer.player)
	}

	public get players() {
		return this.viewers.reduce(
			(acc, viewer) => {
				acc[viewer.player.id] = viewer.player
				return acc
			},
			{} as Record<PlayerId, PlayerModel>,
		)
	}

	private async publishBattleLog(logs: Array<Message>, timeout: number) {
		// We skip waiting for the logs to send if there are no players. This is because
		// the coin flip delay confuses jest. Additionally we don't want to wait longer
		// than what is needed in tests.
		if (this.getPlayers().length === 0) {
			return
		}

		await new Promise((e) => setTimeout(e, timeout))

		this.chat.push(...logs)
		this.chatUpdate()
	}

	/** Send new chat messages to the viewers */
	public chatUpdate() {
		broadcast(this.getPlayers(), {
			type: serverMessages.CHAT_UPDATE,
			messages: this.chat,
		})
	}

	public broadcastState() {
		this.viewers.forEach((viewer) => {
			const localGameState = getLocalGameState(this.game, viewer)

			broadcast([viewer.player], {
				type: serverMessages.GAME_STATE,
				localGameState,
			})
		})

		this.game.voiceLineQueue = []
	}

	public getRandomDelayForAI(coinFlips: Array<CurrentCoinFlip>) {
		return (
			coinFlips.reduce((r, flip) => r + flip.delay, 0) +
			(this.game.rng() * 500 + 500)
		)
	}

	public broadcastToViewers(payload: ServerMessage) {
		broadcast(
			this.viewers.map((viewer) => viewer.player),
			payload,
		)
	}
}
