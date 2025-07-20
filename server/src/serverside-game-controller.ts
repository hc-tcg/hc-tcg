import {GameController} from 'common/game/game-controller'
import {getLocalGameState} from 'common/game/make-local-state'
import {PlayerModel} from 'common/models/player-model'
import {
	ServerMessage,
	serverMessages,
} from 'common/socket-messages/server-messages'
import {EarnedAchievement} from 'common/types/achievements'
import {Message} from 'common/types/game-state'
import {broadcast} from './utils/comm'

export class ServerSideGameController extends GameController {
	override broadcastState() {
		this.viewers.forEach((viewer) => {
			const localGameState = getLocalGameState(this.game, viewer)

			broadcast([viewer.player], {
				type: serverMessages.GAME_STATE,
				localGameState,
			})
		})

		this.game.voiceLineQueue = []
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
