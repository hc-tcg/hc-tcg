import {Hook} from '../../common/types/hooks'
import {GameModel} from './game-model'
import {PlayerModel} from './player-model'

export class RootModel {
	public players: Record<string, PlayerModel> = {}
	public games: Record<string, GameModel> = {}
	public queue: Array<string> = []
	/** Game code ->  time code was created, and info */
	public privateQueue: Record<
		string,
		{
			createdTime: number
			playerId: string | null
			gameCode: string | undefined
			spectatorCode: string | undefined
			spectatorsWaiting: Array<string>
		}
	> = {}
	public hooks = {
		newGame: new Hook<string, (game: GameModel) => void>(),
		gameRemoved: new Hook<string, (game: GameModel) => void>(),
		playerJoined: new Hook<string, (player: PlayerModel) => void>(),
		playerLeft: new Hook<string, (player: PlayerModel) => void>(),
		privateCancelled: new Hook<string, (code: string) => void>(),
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
		this.players[player.id] = player
	}
	public addGame(game: GameModel) {
		this.games[game.id] = game
	}
}
