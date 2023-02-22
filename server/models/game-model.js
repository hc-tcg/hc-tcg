import {getGameState} from '../utils/state-gen'
import {HookMap, SyncBailHook, SyncHook, SyncWaterfallHook} from 'tapable'

/**
 * @typedef {import("./root-model").Root} Root
 * @typedef {import("./player-model").Player} Player
 * @typedef {import("types/index")}
 * @typedef {*} DerivedState
 */

export class Game {
	/**
	 * @param {Array<Player>} players
	 * @param {string | null} code
	 */
	constructor(code = null) {
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

		/** @type {*} */ // @TODO what type is the game task?
		this.task = null

		/** @type {GameState} */
		this.state = null

		// TODO - gameState should be changed only in immutable way so that we can check its history (probs too big to change rn)
		// TODO - once all cards get access to game object, all of these can likely be change to syncbailhooks, for consistency
		this.hooks = {
			/**
			 * Start of the game
			 * @type {SyncHook<[]>}
			 */
			gameStart: new SyncHook([]),
			/**
			 * Start of a turn
			 * @type {SyncBailHook<[DerivedState]>}
			 */
			turnStart: new SyncBailHook(['derived']),
			/**
			 * Used to modify availableActions before each action of a turn
			 * @type {SyncWaterfallHook<[AvailableActions, DerivedState], AvailableActions>}
			 */
			availableActions: new SyncWaterfallHook(['availableActions', 'derived']),
			/**
			 * Start of any action (action = player move, there can be multiple each turn)
			 * @type {SyncHook<[TurnAction, DerivedState]>}
			 */
			actionStart: new SyncHook(['turnAction', 'derived']),
			/**
			 * When a single use effect is applied
			 * @type {SyncBailHook<[TurnAction, DerivedState]>}
			 */
			applyEffect: new SyncBailHook(['turnAction', 'derived']),
			/**
			 * When a single use effect is removed before applying
			 * @type {SyncHook<[TurnAction, DerivedState]>}
			 */
			removeEffect: new SyncHook(['turnAction', 'derived']),
			/**
			 * For special cases where an actions needs a second interaction from one of the players
			 * @type {SyncBailHook<[TurnAction, DerivedState]>}
			 */
			followUp: new SyncBailHook(['turnAction', 'derived']),
			/**
			 * Called once for each target of an attack (active, afk hermits)
			 * @type {SyncWaterfallHook<[Object, TurnAction, DerivedState], Object>}
			 */
			attack: new SyncWaterfallHook(['target', 'turnAction', 'derived']),
			/**
			 * Called once for each target after damage is applied with info about total damge, revival etc.
			 * @type {SyncHook<[Object, TurnAction, DerivedState]>}
			 */
			attackResult: new SyncHook(['result', 'turnAction', 'derived']),
			/**
			 * When card is put down on a board
			 * @type {HookMap<SyncBailHook<[TurnAction, DerivedState]>>}
			 */
			playCard: new HookMap(
				(cardType) => new SyncBailHook(['turnAction', 'derived'])
			),
			/**
			 * When a card is discarded (hand or board)
			 * @type {HookMap<SyncBailHook<[Object]>>}
			 */
			discardCard: new HookMap((cardType) => new SyncBailHook(['card'])),
			/**
			 * When player swaps hermits
			 * @type {SyncHook<[TurnAction, DerivedState]>}
			 */
			changeActiveHermit: new SyncHook(['turnAction', 'derived']),
			/**
			 * At end of any action
			 * @type {SyncHook<[TurnAction, DerivedState]>}
			 */
			actionEnd: new SyncHook(['turnAction', 'derived']),
			/**
			 * When hermit is about to die
			 * @type {SyncWaterfallHook<[Array, Object], Array>}
			 */
			hermitDeath: new SyncWaterfallHook(['recovery', 'deathInfo']),
			/**
			 * At end of every turn
			 * @type {SyncHook<[DerivedState]>}
			 */
			turnEnd: new SyncHook(['derived']),
			/**
			 * When game ends
			 * @type {SyncHook<[]>}
			 */
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
	getPlayers() {
		return Object.values(this.players)
	}

	/** @param {Player} player */
	addPlayer(player) {
		if (this.getPlayers().length > 2)
			throw new Error('Game can have only 2 players')
		this.players[player.playerId] = player
	}

	startGame() {
		if (this.getPlayers().length !== 2)
			throw new Error('Game must 2 have 2 players to start')
		this.state = getGameState(this)
	}
}
