class FirebaseLogs {
	constructor() {
		this.id = 'firebase_logs'
		// any initial setup needed
	}
	register(server) {
		server.hooks.newGame.tap(this.id, (game) => {
			game.hooks.gameStart.tap(this.id, () => {
				const playerStates = Object.values(game.state.players)
				const getHand = (pState) => pState.hand.map((card) => card.cardId)
				console.log('Player 1 initial hand: ', getHand(playerStates[0]))
				console.log('Player 2 initial hand: ', getHand(playerStates[1]))
			})
			game.hooks.gameEnd.tap(this.id, () => {
				console.log('game took turns: ', game.state.turn)
			})
		})

		server.hooks.playerJoined.tap(this.id, (playerInfo) => {
			console.log('player joined: ', playerInfo.playerName)
			console.log(
				'total joined players: ',
				Object.keys(server.allPlayers).length
			)
		})

		server.hooks.playerLeft.tap(this.id, (playerInfo) => {
			console.log('player left: ', playerInfo.playerName)
			console.log(
				'total joined players: ',
				Object.keys(server.allPlayers).length
			)
		})
	}
}

export default FirebaseLogs
