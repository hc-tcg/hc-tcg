import {getGameState} from '../utils/state-gen'
import {HookMap, SyncBailHook, SyncHook, SyncWaterfallHook} from 'tapable'

/**
 * @typedef {import("./root").Root} Root
 * @typedef {import("./player").Player} Player
 * @typedef {import("../types/index")}
 */

export class Game {
	/**
	 * @param {string | null} code
	 * @param {Array<Player>} players
	 */
	constructor(code, players) {
		// create new game

		/** @type {number} */
		this.createdTime = Date.now()

		/** @type {string} */
		this.id = 'game_' + Math.random().toString()

		/** @type {string | null} */
		this.code = code

		// store players in key/value pairs
		// this means we don't need access to root for game logic
		/** @type {Object.<string, Player>} */
		this.players = {}
		players.forEach((player) => {
			this.players[player.playerId] = player
		})

		/** @type {*} */ // @TODO what type is the game task?
		this.task = null

		/** @type {GameState} */
		this.state = null

		// TODO - gameState should be changed only in immutable way so that we can check its history (probs too big to change rn)
		// TODO - once all cards get access to game object, all of these can likely be change to syncbailhooks, for consistency
		this.hooks = {
			/** Start of the game */
			gameStart: new SyncHook([]),
			/** Start of a turn */
			turnStart: new SyncBailHook(['derived']),
			/** Used to modify availableActions for before each step of a turn */
			availableActions: new SyncWaterfallHook(['availableActions', 'derived']),
			/** Start of any action (action = player move, there can be multiple each turn) */
			actionStart: new SyncHook(['turnAction', 'derived']),
			/** When a single use effect is applied */
			applyEffect: new SyncBailHook(['turnAction', 'derived']),
			/** When a single use effect is removed before applying */
			removeEffect: new SyncHook(['turnAction', 'derived']),
			/** For special cases where an actions needs a second interaction from one of the players */
			followUp: new SyncBailHook(['turnAction', 'derived']),
			/** Called once for each target of an attack (active, afk hermits) */
			attack: new SyncWaterfallHook(['target', 'turnAction', 'derived']),
			/** Called once for each target after damage is applied with info about total damge, revival etc. */
			attackResult: new SyncHook(['result', 'turnAction', 'derived']),
			/** When card is put down on a board */
			playCard: new HookMap(
				(cardType) => new SyncBailHook(['turnAction', 'derived'])
			),
			/** When a card is discarded (hand or board) */
			discardCard: new HookMap((cardType) => new SyncBailHook(['card'])),
			/** When player swaps hermits */
			changeActiveHermit: new SyncHook(['turnAction', 'derived']),
			/** At end of any action */
			actionEnd: new SyncHook(['turnAction', 'derived']),
			/** When hermit is about to die */
			hermitDeath: new SyncWaterfallHook(['recovery', 'deathInfo']),
			/** At end of every turn */
			turnEnd: new SyncHook(['derived']),
			/** When game ends */
			gameEnd: new SyncHook([]),
		}

		/** @type {Array<ChatMessage>} */
		this.chat = []

		this.endInfo = {
			/** @type {string | null} */
			deadPlayerId: null,
		}
	}

	// methods for clarity in game code
	/** @returns {Array<string>} */
	getPlayerIds() {
		return Object.keys(this.players)
	}
	/** @returns {Array<Player>} */
	getPlayerValues() {
		return Object.values(this.players)
	}

	/**
	 * @param {Player} player
	 */
	addSecondPlayer(player) {
		this.players[player.playerId] = player

		// generate game state
		this.state = getGameState(this)
	}
}
