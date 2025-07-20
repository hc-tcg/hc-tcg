import {ACHIEVEMENTS_LIST} from 'common/achievements'
import {CARDS_LIST} from 'common/cards'
import {PlayerModel} from 'common/models/player-model'
import {Update} from 'common/types/server-requests'
import {Database} from 'db/db'
import dotenv from 'dotenv'
import {ServerSideGameController} from 'serverside-game-controller'
import {Hook} from '../../common/types/hooks'

export class RootModel {
	public players: Record<string, PlayerModel> = {}
	public games: Record<string, ServerSideGameController> = {}
	public queue: Array<string> = []
	public db: Database
	/** Game code ->  time code was created, and info */
	public privateQueue: Record<
		string,
		{
			createdTime: number
			playerId: string | null
			gameCode: string
			spectatorCode: string | undefined
			spectatorsWaiting: Array<string>
			/** Code used by API consumers to cancel a game. */
			apiSecret?: string
		}
	> = {}
	public awaitingRematch: Record<
		string,
		{
			playerId: string
			opponentId: string
			playerScore: number
			opponentScore: number
			spectatorCode: string | undefined
			spectatorsWaiting: Array<string>
		}
	> = {}
	public hooks = {
		newGame: new Hook<string, (game: ServerSideGameController) => void>(),
		gameRemoved: new Hook<string, (game: ServerSideGameController) => void>(),
		playerJoined: new Hook<string, (player: PlayerModel) => void>(),
		playerLeft: new Hook<string, (player: PlayerModel) => void>(),
		privateCancelled: new Hook<string, (code: string) => void>(),
	}
	public updates: Array<Update> = []

	public constructor() {
		const env = dotenv.config()
		this.db = new Database(
			{...env, ...process.env},
			CARDS_LIST,
			ACHIEVEMENTS_LIST,
			14,
		)
		this.db.new()
	}

	public createPrivateGame(playerId: string | null) {
		const gameCode = (Math.random() + 1).toString(16).substring(2, 8)
		const spectatorCode = (Math.random() + 1).toString(16).substring(2, 8)
		const apiSecret = (Math.random() + 1).toString(16).substring(2)
		this.privateQueue[gameCode] = {
			createdTime: Date.now(),
			playerId,
			gameCode,
			spectatorCode,
			spectatorsWaiting: [],
			apiSecret,
		}
		return {gameCode, spectatorCode, apiSecret}
	}

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
		const time = Date.now()
		const date = new Date(time)
		console.log(
			`${date.toLocaleTimeString('it-IT')}: Player [${player.uuid}] has logged in.`,
		)
	}
	public addGame(game: ServerSideGameController) {
		this.games[game.id] = game
	}
}
