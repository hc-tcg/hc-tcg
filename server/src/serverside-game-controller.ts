import {
	GameController,
	GameControllerProps,
	GameViewer,
} from 'common/game/game-controller'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {
	ServerMessage,
	serverMessages,
} from 'common/socket-messages/server-messages'
import {EarnedAchievement} from 'common/types/achievements'
import {Message} from 'common/types/game-state'
import {broadcast} from './utils/comm'
import {GameModel} from 'common/models/game-model'
import {PlayerEntity} from 'common/entities'

type ServerGameViewerProps = {
	spectator: boolean
	replayer: boolean
	playerOnLeft: PlayerEntity
	player: PlayerModel
}

export class ServerGameViewer extends GameViewer {
	player: PlayerModel

	constructor(game: GameModel, props: ServerGameViewerProps) {
		super(game, props)
		this.player = props.player
	}
}

export class ServerSideGameController extends GameController {
	override viewers: Array<ServerGameViewer> = []

	public getPlayers() {
		return this.viewers.map((viewer) => viewer.player!)
	}

	public get players() {
		return this.viewers.reduce(
			(acc, viewer) => {
				if (!viewer.player) return acc
				acc[viewer.player.id] = viewer.player
				return acc
			},
			{} as Record<PlayerId, PlayerModel>,
		)
	}

	override async publishBattleLog(logs: Array<Message>, timeout: number) {
		// We skip waiting for the logs to send if there are no players. This is because
		// the coin flip delay confuses jest. Additionally we don't want to wait longer
		// than what is needed in tests.
		if (this.getPlayers().length === 0) {
			this.chat.push(...logs)
			return
		}

		await new Promise((e) => setTimeout(e, timeout))

		this.chat.push(...logs)
		this.chatUpdate()
	}

	override addViewer(viewer: {
		spectator: boolean
		replayer: boolean
		playerOnLeft: PlayerEntity
		player: PlayerModel
	}): ServerGameViewer {
		const v = new ServerGameViewer(this.game, viewer)
		this.viewers.push(v)
		return v
	}

	/** Send new chat messages to the viewers */
	public chatUpdate() {
		broadcast(this.getPlayers(), {
			type: serverMessages.CHAT_UPDATE,
			messages: this.chat,
		})
	}

	override onAchievementComplete(
		player: PlayerModel,
		achievement: EarnedAchievement,
	) {
		broadcast([player], {
			type: serverMessages.ACHIEVEMENT_COMPLETE,
			achievement,
		})
	}

	public broadcastToViewers(payload: ServerMessage) {
		broadcast(
			this.viewers.map((viewer) => viewer.player),
			payload,
		)
	}
}
