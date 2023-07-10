import {getGameState} from '../utils/state-gen'
import {HookMap, SyncBailHook, SyncHook, SyncWaterfallHook} from 'tapable'
import {DerivedStateModel} from './derived-state-model'
import {PlayerModel} from './player-model'

/**
 * @typedef {import("common/types/game-state").GameState} GameState
 * @typedef {import("common/types/game-state").AvailableActionsT} AvailableActionsT
 * @typedef {import("common/types/game-state").PlayerState} PlayerState
 * @typedef {import("common/types/chat").MessageInfoT} MessageInfoT
 * @typedef {import("redux-saga").Task} Task
 */

export class GameModel {
	/**
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
		/** @type {Object.<string, PlayerModel>} */
		this.players = {}

		/** @type {Task | null} */
		this.task = null

		/** @type {GameState} */
		this.state = /** @type {any} */ (null)

		/** @type {DerivedStateModel} */
		this.ds = new DerivedStateModel(this)

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
			 * @type {SyncHook<[{skipTurn?: boolean}]>}
			 */
			turnStart: new SyncHook(['turnConfig']),
			/**
			 * Used to modify availableActions before each action of a turn
			 * @type {SyncWaterfallHook<[AvailableActionsT, Array<string>, AvailableActionsT], AvailableActionsT>}
			 */
			availableActions: new SyncWaterfallHook([
				'availableActions',
				'pastTurnActions',
				'lockedActions',
			]),
			/**
			 * Start of any action (action = player move, there can be multiple each turn)
			 * @type {SyncHook<[TurnAction, ActionState]>}
			 */
			actionStart: new SyncHook(['turnAction', 'actionState']),
			/**
			 * When a single use effect is applied
			 * @type {SyncBailHook<[TurnAction, ActionState]>}
			 */
			applyEffect: new SyncBailHook(['turnAction', 'actionState']),
			/**
			 * When a single use effect is removed before applying
			 * @type {SyncHook<[TurnAction, ActionState]>}
			 */
			removeEffect: new SyncHook(['turnAction', 'actionState']),
			/**
			 * For special cases where an actions needs a second interaction from one of the players
			 * @type {SyncBailHook<[TurnAction, FollowUpState]>}
			 */
			followUp: new SyncBailHook(['turnAction', 'followUpState']),
			/**
			 * Called before attack to enable modifiyng attack state
			 * @type {SyncHook<[TurnAction, AttackState]>}
			 */
			attackState: new SyncHook(['turnAction', 'attackState']),
			/**
			 * Called once for each target of an attack (active, afk hermits)
			 * @type {SyncWaterfallHook<[AttackTarget, TurnAction, AttackState], AttackTarget>}
			 */
			attack: new SyncWaterfallHook(['target', 'turnAction', 'attackState']),
			/**
			 * Called once for each target after damage is applied with info about total damge, revival etc.
			 * @type {SyncHook<[AttackTargetResult, TurnAction, AttackState]>}
			 */
			attackResult: new SyncHook(['result', 'turnAction', 'attackState']),
			/**
			 * For extra validation when players attempts to place down a card
			 * @type {HookMap<SyncBailHook<[TurnAction, ActionState]>>}
			 */
			validateCard: new HookMap((cardType) => new SyncBailHook(['turnAction', 'actionState'])),
			/**
			 * When a card is succesfully placed on board
			 * @type {HookMap<SyncHook<[TurnAction, ActionState]>>}
			 */
			playCard: new HookMap((cardType) => new SyncHook(['turnAction', 'actionState'])),
			/**
			 * When a card is discarded (hand or board)
			 * @type {HookMap<SyncBailHook<[Object, boolean]>>}
			 */
			discardCard: new HookMap((cardType) => new SyncBailHook(['card', 'singleUseSlot'])),
			/**
			 * When player swaps hermits
			 * @type {SyncHook<[TurnAction, ActionState]>}
			 */
			changeActiveHermit: new SyncHook(['turnAction', 'actionState']),
			/**
			 * When opponent's followup times out
			 * @type {SyncHook<[]>}
			 */
			followUpTimeout: new SyncHook([]),
			/**
			 * At end of any action
			 * @type {SyncHook<[TurnAction, ActionState]>}
			 */
			actionEnd: new SyncHook(['turnAction', 'actionState']),
			/**
			 * When hermit is about to die
			 * @type {SyncWaterfallHook<[Array, Object], Array>}
			 */
			hermitDeath: new SyncWaterfallHook(['recovery', 'deathInfo']),
			/**
			 * At end of every turn
			 * @type {SyncHook<[]>}
			 */
			turnEnd: new SyncHook([]),
			/**
			 * When game ends
			 * @type {SyncHook<[]>}
			 */
			gameEnd: new SyncHook([]),
		}

		/** @type {Array<MessageInfoT>} */
		this.chat = []

		this.endInfo = {
			/** @type {Array<string>} */
			deadPlayerIds: [],
			/** @type {string|null} */
			winner: null,
			/** @type {'timeout'|'forfeit'|'tie'|'player_won'|'error'|null} */
			outcome: null,
			/** @type {'hermits'|'lives'|'cards'|'time'|null} */
			reason: null,
		}

		/** @type {TurnState} */
		this.turnState = {
			availableActions: [],
			opponentAvailableActions: [],
			pastTurnActions: [],
		}
	}

	// methods for clarity in game code
	/** @returns {Array<string>} */
	getPlayerIds() {
		return Object.keys(this.players)
	}

	/** @returns {Array<PlayerModel>} */
	getPlayers() {
		return Object.values(this.players)
	}

	/** @param {PlayerModel} player */
	addPlayer(player) {
		if (this.getPlayers().length > 2) throw new Error('Game can have only 2 players')
		if (!player) throw new Error('Player is null')
		this.players[player.playerId] = player
	}

	initialize() {
		if (this.getPlayers().length !== 2) throw new Error('Game must 2 have 2 players to start')
		this.state = getGameState(this)
	}
}
