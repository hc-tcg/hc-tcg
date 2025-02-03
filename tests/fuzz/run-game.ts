import {Card} from 'common/cards/types'
import {COINS} from 'common/coins'
import {AIComponent} from 'common/components/ai-component'
import {GameSettings} from 'common/models/game-model'
import {CurrentCoinFlip} from 'common/types/game-state'
import {VirtualAI} from 'common/types/virtual-ai'
import {applyMiddleware, createStore} from 'redux'
import createSagaMiddleware from 'redux-saga'
import {GameController} from 'server/game-controller'
import gameSaga, {figureOutGameResult} from 'server/routines/game'
import {call} from 'typed-redux-saga'

class FuzzyGameController extends GameController {
	public override getRandomDelayForAI(_flips: Array<CurrentCoinFlip>) {
		return 0
	}
}

function getTestPlayer(playerName: string, deck: Array<Card>) {
	return {
		model: {
			name: playerName,
			minecraftName: playerName,
			censoredName: playerName,
			selectedCoinHead: 'creeper' as keyof typeof COINS,
		},
		deck,
	}
}

async function testSaga(rootSaga: any) {
	const sagaMiddleware = createSagaMiddleware({})
	createStore(() => {}, applyMiddleware(sagaMiddleware))

	let saga = sagaMiddleware.run(function* () {
		yield* rootSaga
	})

	if (saga.error()) {
		throw saga.error()
	}

	await saga.toPromise()
}

const defaultGameSettings = {
	maxTurnTime: 90 * 1000,
	extraActionTime: 30 * 1000,
	showHooksState: {
		enabled: false,
		clearConsole: false,
	},
	blockedActions: [],
	availableActions: [],
	autoEndTurn: false,
	disableDeckOut: true,
	startWithAllCards: false,
	unlimitedCards: false,
	oneShotMode: false,
	extraStartingCards: [],
	disableDamage: false,
	noItemRequirements: false,
	forceCoinFlip: false,
	shuffleDeck: true,
	logErrorsToStderr: false,
	verboseLogging: !!process.env.UNIT_VERBOSE,
	disableRewardCards: false,
} satisfies GameSettings

/**
 * Test a saga against a game. The game is created with default settings similar to what would be found in production.
 * Note that decks are not shuffled in test games.
 */
export async function testGame(options: {
	playerOne: {
		deck: Array<Card>
		AI: VirtualAI
	}
	playerTwo: {
		deck: Array<Card>
		AI: VirtualAI
	}
	seed: string
	debug: boolean
}) {
	let controller = new FuzzyGameController(
		getTestPlayer('playerOne', options.playerOne.deck),
		getTestPlayer('playerTwo', options.playerTwo.deck),
		{
			randomizeOrder: false,
			randomSeed: options.seed,
			settings: {
				...defaultGameSettings,
				verboseLogging: options.debug,
			},
		},
	)

	// Player One
	controller.game.components.new(
		AIComponent,
		controller.game.opponentPlayer.entity,
		options.playerOne.AI,
	)
	// Player Two
	controller.game.components.new(
		AIComponent,
		controller.game.currentPlayer.entity,
		options.playerTwo.AI,
	)

	await testSaga(call(gameSaga, controller))

	return figureOutGameResult(controller.game)
}
