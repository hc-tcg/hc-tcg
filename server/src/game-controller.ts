import {PlayerComponent} from 'common/components'
import {PlayerEntity} from 'common/entities'
import {GameModel, GameProps} from 'common/models/game-model'
import {PlayerId, PlayerModel} from 'common/models/player-model'
import {GameMessage, GameStartupInformation} from './routines/game'
import {ServerMessage} from 'common/socket-messages/server-messages'
import {Message as ChatMessage} from 'common/types/game-state'
import root from 'serverRoot'
import {broadcast} from 'utils/comm'
import {getLocalGameState} from 'utils/state-gen'

export type GameViewer = {id: PlayerId; type: 'player' | 'spectator'}

type Props = {
	game: GameModel
	viewers: Array<GameViewer>
	playerOne: {
		entity: PlayerEntity
		playerId: PlayerId
	}
	playerTwo: {
		entity: PlayerEntity
		playerId: PlayerId | null
	}
	props: GameProps
	apiSecret?: string
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
		// The player ID is null if player 2 is an AI/Boss
		playerId: PlayerId | null
	}
	props: GameProps
	apiSecret?: string
	chat: Array<ChatMessage> = []
	history: Array<GameMessage> = []

	constructor({game, viewers, playerOne, playerTwo, props, apiSecret}: Props) {
		this.game = game
		this.viewers = viewers
		this.playerOne = playerOne
		this.playerTwo = playerTwo
		this.apiSecret = apiSecret
		this.props = props
	}

	public startupInformation(entity?: PlayerEntity): GameStartupInformation {
		return {
			props: this.props,
			entity: entity,
			history: this.history,
			timer: this.game.state.timer,
		}
	}

	public gameState(entity?: PlayerEntity): GameStartupInformation {
		let isSpectator = false
		if (!entity) {
			isSpectator = true
			entity = this.game.state.order[0]
		}
		let game = getLocalGameState(
			this.game,
			this.game.components.get(entity),
			isSpectator,
		)
	}

	public broadcastToViewers(msg: ServerMessage) {
		for (const viewer of this.viewers) {
			broadcast([root.players[viewer.id]], msg)
		}
	}

	public get playerModels(): Record<PlayerId, PlayerModel> {
		let out: Record<PlayerId, PlayerModel> = {}

		for (const player of this.viewers) {
			out[player.id] = root.players[player.id]
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

	public getPlayerModelByEntity(entity: PlayerEntity): PlayerModel | null {
		if (entity === this.playerOne.entity) {
			return this.playerModels[this.playerOne.playerId]
		}
		if (entity === this.playerTwo.entity && this.playerTwo.playerId) {
			return this.playerModels[this.playerTwo.playerId]
		}
		return null
	}
}
