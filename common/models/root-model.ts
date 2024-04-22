import {plugins} from '../../server/src/plugins'
import {PlayerModel} from './player-model'
import {GameModel} from './game-model'
import {Hook} from '../../common/types/hooks'

export class RootModel {
	public players: Record<string, PlayerModel> = {}
	public games: Record<string, GameModel> = {}
	public queue: Array<string> = []
	/** Game code ->  time code was created, and info */
	public privateQueue: Record<string, {createdTime: number; playerId: string | null}> = {}
	public hooks = {
		newGame: new Hook<(game: GameModel) => void>(),
		gameRemoved: new Hook<(game: GameModel) => void>(),
		playerJoined: new Hook<(player: PlayerModel) => void>(),
		playerLeft: new Hook<(player: PlayerModel) => void>(),
	}
	public updates: Record<string, Array<string>> = {}

	public getGameIds() {
		return Object.keys(this.games)
	}
	public getGames() {
		return Object.values(this.games)
	}
	public getPlayerIds() {
		return Object.keys(this.players)
	}
	public getPlayers() {
		return Object.values(this.players)
	}
	public addPlayer(player: PlayerModel) {
		this.players[player.playerId] = player
	}
	public addGame(game: GameModel) {
		this.games[game.id] = game
	}
}
