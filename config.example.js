/** Before starting the program, make sure to copy this file to `config.js`. */

export default {
	server: {
		/** Server port */
		port: 9000,
		/** Port for vite client server */
		clientDevPort: 3002,
		/** Path for the client build used */
		clientPath: 'client/dist',
		/** Useful when testing on local network or when your server runs on a different domain */
		cors: [
			'http://localhost:3002',
			'https://hc-tcg-beta.fly.dev',
			'https://hc-tcg-testing.fly.dev',
			'https://hc-tcg.online',
			'https://testing.hc-tcg.online',
		],
		/** Identifier for your instance when tracking stats */
		world: 'LTF42',
	},
	game: {
		limits: {
			maxTurnTime: 90,
			extraActionTime: 30,
			minCards: 42,
			maxCards: 42,
			maxDuplicates: 3,
			maxDeckCost: 42,
			bannedCards: ['evilxisuma_boss', 'feather', 'item_any_rare'],
			disabledCards: ['iskallman_common', 'iskallman_rare'],
			rematchTime: 90 * 1000,
			gameTimeout: 1000 * 60 * 60 * 2 /* 2 hours */,
		},
		replayVersion: 0x02,
		disableDeckValidation: false,
		/** Add extra cards into your hand at the start of the game */
		extraStartingCards: [],
		/** Remove the item requirement for attacks */
		noItemRequirements: false,
		/** Force coinflips to always roll heads */
		forceCoinFlip: false,
		/** All attacks will instantly knock out their target. */
		oneShotMode: false,
		/** Disable attacks from dealing damage */
		disableDamage: false,
		/** Disable the deck out win condition. */
		disableDeckOut: false,
		/** Start the game with every card in your deck. Also disables deck out. */
		startWithAllCards: false,
		/** Start the game with every card in the game. Also disables deck out. */
		unlimitedCards: false,
		/** Block specific actions every turn. */
		blockedActions: [],
		/** Make specific actions available every turn. */
		availableActions: [],
		/** Shuffe the player's decks at the start of the game. */
		shuffleDeck: true,
		/** Log assertion errors in turn acitons to stderr instead of throwing them. */
		logErrorsToStderr: true,
		verboseLogging: true,
		/** Show hooks in the console */
		showHooksState: {
			enabled: false,
			clearConsole: true,
		},
		/** When you have no actions left, automatically switch to the opponent's turn. */
		autoEndTurn: false,
		logAttackHistory: false,
		disableRewardCards: false,
		renderCardsDynamically: false,
	},
	unlockAllCosmetics: false,
	/**  URL to use for the Hall of Fame. */
	statsUrl: null,
	logoSubText: '10k games since 1.0!',
}
