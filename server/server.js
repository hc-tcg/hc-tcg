import {SyncHook} from 'tapable'

const server = {
	allPlayers: [],
	games: [],
	hooks: {
		newGame: new SyncHook(['game']),
		playerJoined: new SyncHook(['player']),
		playerLeft: new SyncHook(['player']),
	},
}

export default server
