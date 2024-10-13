import {PlayerComponent} from 'common/components'
import {PlayerEntity} from 'common/entities'
import {GameModel, GameProps} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {GameMessage} from 'common/routines/game'
import {ServerMessage} from 'common/socket-messages/server-messages'
import {Message} from 'common/types/game-state'
import root from 'serverRoot'
import {broadcast} from 'utils/comm'

export type GameViewer = [PlayerId, 'player' | 'spectator']

type Props = {
	game: GameModel
	viewers: Array<GameViewer>
	playerOne: {
		entity: PlayerEntity
		playerId: PlayerId
	}
	playerTwo: {
		entity: PlayerEntity
		playerId: PlayerId
	}
	props: GameProps
}

/** A class that maintains all the information needed to send a game to clients */
export class GameController {
	game: GameModel
	viewers: Array<GameViewer>
	playerOne: {
		entity: PlayerEntity
		playerId: PlayerId
	}
	playerTwo: {
		entity: PlayerEntity
		playerId: PlayerId
	}
	props: GameProps
	chat: Array<Message> = []
	history: Array<GameMessage> = []

	constructor({game, viewers, playerOne, playerTwo, props}: Props) {
		this.game = game
		this.viewers = viewers
		this.playerOne = playerOne
		this.playerTwo = playerTwo
		this.props = props
	}

	public broadcastToViewers(msg: ServerMessage) {
		for (const viewer of this.viewers) {
			broadcast([root.players[viewer[0]]], msg)
		}
	}

	public get playerModels(): Record<PlayerId, PlayerModel> {
		let out: Record<PlayerId, PlayerModel> = {}

		for (const player of this.viewers) {
			out[player[0]] = root.players[player[0]]
		}

		return out
	}

	public getEntityById(id: PlayerId): PlayerEntity | null {
		if (this.playerOne.playerId === id) {
			return this.playerOne.entity
		}
		if (this.playerTwo.playerId === id) {
			return this.playerTwo.entity
		}
		return null
	}

	public getPlayerComponentById(id: PlayerId): PlayerComponent | null {
		const entity = this.getEntityById(id)
		return this.game.components.find(
			PlayerComponent,
			(_game, component) => component.entity === entity,
		)
	}
}
