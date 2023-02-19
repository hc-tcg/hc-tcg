import { createRequire } from 'module';
const require = createRequire(import.meta.url);
var serviceAccount = require("../adminKey.json");
var admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hc-tcg-leaderboard-default-rtdb.firebaseio.com"
});

class FirebaseLogs {
	constructor() {
		this.id = 'firebase_logs'
    this.db = admin.database();
    this.usageref = this.db.ref("/cardusage");
    this.usageref.once("value", ss=>{
      let tmp = ss.val() || {};
      this.usage = tmp;
    });
    this.playercountref = this.db.ref("/playersOnline");
    this.gamecountref = this.db.ref("/gamesOnline");
    this.gamecountref.set(0);
	}
	register(server) {
		server.hooks.newGame.tap(this.id, (game) => {
			game.hooks.gameStart.tap(this.id, () => {
				const playerStates = Object.values(game.state.players)
				const getHand = (pState) => pState.hand.map((card) => card.cardId)
				console.log('Player 1 initial hand: ', getHand(playerStates[0]))
				console.log('Player 2 initial hand: ', getHand(playerStates[1]))
        let pid0 = playerStates[0].id;
        server.allPlayers[pid0].socket.emit("andytest", {"yo":"yes"});
        let pid1 = playerStates[1].id;
        server.allPlayers[pid1].socket.emit("andytest", {"yo":"yes2"});
        let numGames = Object.values(server.games).filter(gameRecord => !!gameRecord.task).length;
        this.gamecountref.set(numGames);
			})
			game.hooks.gameEnd.tap(this.id, () => {
				console.log('game took turns: ', game.state.turn)
        const playerStates = Object.values(game.state.players)
        let pid0 = playerStates[0].id;
        server.allPlayers[pid0].socket.emit("gameoverstat", game.deadPlayerId === pid0 ? 'you_lost' : 'you_won');
        let pid1 = playerStates[1].id;
        server.allPlayers[pid1].socket.emit("gameoverstat", game.deadPlayerId === pid1 ? 'you_lost' : 'you_won');
        //"gameoverstat";
        let numGames = Object.values(server.games).filter(gameRecord => !!gameRecord.task).length;
        this.gamecountref.set(numGames-1);
			})
		})

		server.hooks.playerJoined.tap(this.id, (playerInfo) => {
			let numPlayers = Object.keys(server.allPlayers).length;
      this.playercountref.set(numPlayers);
			console.log('player joined: ', playerInfo.playerName)
		})

		server.hooks.playerLeft.tap(this.id, (playerInfo) => {
			console.log('player left: ', playerInfo.playerName)
			let numPlayers = Object.keys(server.allPlayers).length;
      this.playercountref.set(numPlayers);
		})
	}
}

export default FirebaseLogs
