import {PlayerComponent} from 'common/components'
import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel, gameSettingsFromEnv} from 'common/models/game-model'
import {PlayerModel} from 'common/models/player-model'
import {ServerMessage} from 'common/socket-messages/server-messages'
import {Deck} from 'common/types/deck'
import {Message} from 'common/types/game-state'
import {broadcast} from 'utils/comm'

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
		player1: PlayerModel,
		player2: PlayerModel,
		player1Deck: Deck,
		player2Deck: Deck,
		gameCode?: string,
		spectatorCode?: string,
		apiSecret?: string,
	) {
		this.game = new GameModel(
			GameModel.newGameSeed(),
			{
				model: player1,
				deck: player1Deck.cards.map((card) => card.props.numericId),
			},
			{
				model: player2,
				deck: player2Deck.cards.map((card) => card.props.numericId),
			},
			gameSettingsFromEnv(),
		)

		this.createdTime = Date.now()
		this.id = 'game-controller_' + Math.random().toString()
		this.gameCode = gameCode || null
		this.spectatorCode = spectatorCode || null
		this.apiSecret = apiSecret || null
		this.chat = []
		this.task = null

		let playerEntities = this.game.components.filterEntities(PlayerComponent)

		// Note player one must be added before player two to make sure each player has the right deck.
		this.game.components.new(ViewerComponent, {
			player: player1,
			spectator: false,
			playerOnLeft: playerEntities[0],
		})

		this.game.components.new(ViewerComponent, {
			player: player2,
			spectator: false,
			playerOnLeft: playerEntities[1],
		})
	}

	public broadcastToViewers(payload: ServerMessage) {
		broadcast(
			this.game.viewers.map((viewer) => viewer.player),
			payload,
		)
	}
}
