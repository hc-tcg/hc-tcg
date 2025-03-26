import {Achievement} from 'common/achievements/types'
import EvilXisumaBoss, {
	BOSS_ATTACK,
	supplyBossAttack,
} from 'common/cards/boss/hermits/evilxisuma_boss'
import {Card} from 'common/cards/types'
import {
	AchievementComponent,
	BoardSlotComponent,
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
} from 'common/components'
import query, {ComponentQuery} from 'common/components/query'
import {defaultAppearance} from 'common/cosmetics/default'
import {PlayerEntity} from 'common/entities'
import {GameModel, GameSettings} from 'common/models/game-model'
import {SlotTypeT} from 'common/types/cards'
import {GameOutcome} from 'common/types/game-state'
import {LocalModalResult} from 'common/types/server-requests'
import {
	attackToAttackAction,
	slotToPlayCardAction,
} from 'common/types/turn-action-data'
import {PlayerSetupDefs} from 'common/utils/state-gen'
import {applyMiddleware, createStore} from 'redux'
import createSagaMiddleware, {SagaMiddleware} from 'redux-saga'
import {GameController} from 'server/game-controller'
import {LocalMessage, localMessages} from 'server/messages'
import gameSaga, {figureOutGameResult} from 'server/routines/game'
import {getLocalCard} from 'server/utils/state-gen'
import {call, put, race} from 'typed-redux-saga'

function getTestPlayer(playerName: string, deck: Array<Card>): PlayerSetupDefs {
	return {
		model: {
			name: playerName,
			minecraftName: playerName,
			censoredName: playerName,
			appearance: defaultAppearance,
			uuid: '',
		},
		deck,
		score: 0,
	}
}

export function findCardInHand(player: PlayerComponent, card: Card) {
	let cardInHand = player
		.getHand()
		.find((cardComponent) => cardComponent.props.id === card.id)
	if (!cardInHand) throw new Error(`Could not find card \`${card.id}\` in hand`)
	return cardInHand
}

/** End the current player's turn. */
export function* endTurn(game: GameModel) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: 'END_TURN',
		},
	})
}

/** Play a card from your hand to a row on the game board */
export function playCardFromHand(
	game: GameModel,
	card: Card,
	slotType: 'single_use',
): any
export function playCardFromHand(
	game: GameModel,
	card: Card,
	slotType: 'hermit' | 'attach',
	row: number,
	player?: PlayerEntity,
): any
export function playCardFromHand(
	game: GameModel,
	card: Card,
	slotType: 'item',
	row: number,
	index: number,
	player?: PlayerEntity,
): any
export function* playCardFromHand(
	game: GameModel,
	card: Card,
	slotType: SlotTypeT,
	row?: number,
	indexOrPlayer?: number | PlayerEntity,
	itemSlotPlayer?: PlayerEntity,
) {
	let cardComponent = findCardInHand(game.currentPlayer, card)
	const player =
		itemSlotPlayer ||
		(typeof indexOrPlayer === 'string'
			? indexOrPlayer
			: game.currentPlayerEntity)
	const index = typeof indexOrPlayer === 'number' ? indexOrPlayer : undefined

	const slot = game.components.find(
		SlotComponent,
		query.slot.player(player),
		(_game, slot) =>
			(!slot.inRow() && index === undefined) ||
			(slot.inRow() && slot.row.index === row),
		(_game, slot) =>
			index === undefined || (slot.inRow() && slot.index === index),
		(_game, slot) => slot.type === slotType,
	)!

	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: slotToPlayCardAction[cardComponent.props.category],
			card: getLocalCard(game, cardComponent),
			slot: slot.entity,
		},
	})
}

/** Apply the effect card in the single use slot. This should be used to apply status effects that use the "should apply" modal. */
export function* applyEffect(game: GameModel) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: 'APPLY_EFFECT',
		},
	})
}

/** Removes the effect card in the single use slot. This should be used to cancel effects that use the "should apply" modal or cancel an attack with pick requests. */
export function* removeEffect(game: GameModel) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: 'REMOVE_EFFECT',
		},
	})
}

/** Attack with the current player. */
export function* attack(
	game: GameModel,
	attack: 'primary' | 'secondary' | 'single-use',
) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: attackToAttackAction[attack],
		},
	})
}

/** Change the active hermit row for the current player. */
export function* changeActiveHermit(game: GameModel, index: number) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: 'CHANGE_ACTIVE_HERMIT',
			entity: game.components.findEntity(
				SlotComponent,
				query.slot.currentPlayer,
				query.slot.rowIndex(index),
			)!,
		},
	})
}

/** Pick a slot for a pick request */
export function* pick(
	game: GameModel,
	...slot: Array<ComponentQuery<SlotComponent>>
) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.state.pickRequests[0].player,
		action: {
			type: 'PICK_REQUEST',
			entity: game.components.find(SlotComponent, ...slot)!.entity,
		},
	})
}

/** Respond to a modal request. */
export function* finishModalRequest(
	game: GameModel,
	modalResult: LocalModalResult,
) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.state.modalRequests[0].player,
		action: {
			type: 'MODAL_REQUEST',
			modalResult,
		},
	})
}

export function* forfeit(player: PlayerEntity) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: player,
		action: {
			type: 'FORFEIT',
			player,
		},
	})
}

export function getWinner(game: GameModel): PlayerComponent | null {
	if (game.outcome === undefined) return null
	if (game.outcome.type === 'tie') return null
	if (game.outcome.type === 'game-crash') return null
	return game.components.find(
		PlayerComponent,
		(_game, component) =>
			game.outcome?.type === 'player-won' &&
			component.entity === game.outcome.winner,
	)
}

function getSagaMiddleware(): SagaMiddleware<object> {
	const sagaMiddleware = createSagaMiddleware({
		// Prevent default behavior where redux saga logs errors to stderr. This is not useful to tests.
		onError: (_err, {sagaStack: _}) => {},
	})
	createStore(() => {}, applyMiddleware(sagaMiddleware))
	return sagaMiddleware
}

function testSagas(rootSaga: any, testingSaga: any) {
	const sagaMiddleware = getSagaMiddleware()

	let saga = sagaMiddleware.run(function* () {
		yield* race([rootSaga, testingSaga])
	})

	if (saga.error()) {
		throw saga.error()
	}
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
	forceCoinFlip: true,
	shuffleDeck: false,
	logErrorsToStderr: false,
	verboseLogging: !!process.env.UNIT_VERBOSE,
	disableRewardCards: false,
} satisfies GameSettings

/**
 * Test a saga against a game. The game is created with default settings similar to what would be found in production.
 * Note that decks are not shuffled in test games.
 */
export function testGame(
	options: {
		saga: (game: GameModel) => any
		// This is the place to check the state of the game after it ends.
		then?: (game: GameModel, outcome: GameOutcome) => any
		playerOneDeck: Array<Card>
		playerTwoDeck: Array<Card>
	},
	settings: Partial<GameSettings> = {},
) {
	let controller = new GameController(
		getTestPlayer('playerOne', options.playerOneDeck),
		getTestPlayer('playerTwo', options.playerTwoDeck),
		{
			randomizeOrder: false,
			randomSeed: 'Test Game Seed',
			settings: {
				...defaultGameSettings,
				...settings,
			},
		},
	)

	let testEnded = false

	testSagas(
		call(function* () {
			yield* call(gameSaga, controller)
		}),
		call(function* () {
			yield* call(options.saga, controller.game)
			testEnded = true
		}),
	)

	if (!options.then && !testEnded) {
		throw new Error('Game was ended before the test finished running.')
	}

	if (options.then) {
		const result = figureOutGameResult(controller.game)
		options.then(controller.game, result)
	}
}

/**
 * Works similarly to `testGame`, but for testing the Evil X boss fight
 */
export function testBossFight(
	options: {
		/**
		 * ```ts
		 * saga: function* (game) {
		 * 	...
		 * 	yield* endTurn(game)
		 * 	// Boss' first turn
		 * 	yield* playCardFromHand(game, EvilXisumaBoss, 'hermit', 0)
		 * 	yield* bossAttack(game, '50DMG')
		 * 	...
		 * }
		 * ```
		 */
		saga: (game: GameModel) => any
		// This is the place to check the state of the game after it ends.
		then?: (game: GameModel) => any
		playerDeck: Array<Card>
	},
	settings?: Partial<GameSettings>,
) {
	let controller = new GameController(
		getTestPlayer('playerOne', options.playerDeck),
		{
			model: {
				name: 'Evil Xisuma',
				censoredName: 'Evil Xisuma',
				minecraftName: 'EvilXisuma',
				appearance: {...defaultAppearance},
				uuid: '',
				disableDeckingOut: true,
			},
			deck: [EvilXisumaBoss],
			score: 0,
		},
		{
			randomizeOrder: false,
			randomSeed: 'Boss fight seed',
			settings: {...defaultGameSettings, ...settings, disableRewardCards: true},
		},
	)

	controller.game.state.isEvilXBossGame = true

	function destroyRow(row: RowComponent) {
		controller.game.components
			.filterEntities(BoardSlotComponent, query.slot.rowIs(row.entity))
			.forEach((slotEntity) => controller.game.components.delete(slotEntity))
		controller.game.components.delete(row.entity)
	}

	// Remove challenger's rows other than indexes 0, 1, and 2
	controller.game.components
		.filter(
			RowComponent,
			query.row.opponentPlayer,
			(_game, row) => row.index > 2,
		)
		.forEach(destroyRow)
	// Remove boss' rows other than index 0
	controller.game.components
		.filter(
			RowComponent,
			query.row.currentPlayer,
			query.not(query.row.index(0)),
		)
		.forEach(destroyRow)
	// Remove boss' item slots
	controller.game.components
		.filter(RowComponent, query.row.currentPlayer)
		.forEach((row) => {
			row.itemsSlotEntities?.forEach((slotEntity) =>
				controller.game.components.delete(slotEntity),
			)
			row.itemsSlotEntities = []
		})

	let testEnded = false

	testSagas(
		call(function* () {
			yield* call(gameSaga, controller)
		}),
		call(function* () {
			yield* call(options.saga, controller.game)
			testEnded = true
		}),
	)

	if (!options.then && !testEnded) {
		throw new Error('Game was ended before the test finished running.')
	}

	if (options.then) options.then(controller.game)
}

/** Test an achievement for player one in a game */
export function testAchivement(
	options: {
		achievement: Achievement
		playGame: (game: GameModel) => any
		checkAchivement: (
			game: GameModel,
			achievement: AchievementComponent,
			outcome: GameOutcome,
		) => any
		playerOneDeck: Array<Card>
		playerTwoDeck: Array<Card>
	},
	settings: Partial<GameSettings> = {},
) {
	let achievementComponent: AchievementComponent
	let player: PlayerComponent

	let saga = function* (game: GameModel) {
		player = game.currentPlayer
		let achievementProgress: Record<number, number> = {}

		achievementComponent = game.components.new(
			AchievementComponent,
			options.achievement.numericId,
			player.entity,
			{goals: achievementProgress, levels: []},
		)
		const achievementObserver = game.components.new(
			ObserverComponent,
			achievementComponent.entity,
		)

		options.achievement.onGameStart(
			game,
			player,
			achievementComponent,
			achievementObserver,
		)

		yield* options.playGame(game)
	}

	let then = function (game: GameModel, gameOutcome: GameOutcome) {
		options.achievement.onGameEnd(
			game,
			player,
			achievementComponent,
			gameOutcome,
		)
		options.checkAchivement(game, achievementComponent, gameOutcome)
	}

	testGame(
		{
			saga,
			then,
			playerOneDeck: options.playerOneDeck,
			playerTwoDeck: options.playerTwoDeck,
		},
		settings,
	)
}

export function* bossAttack(game: GameModel, ...attack: BOSS_ATTACK) {
	const bossCard = game.components.find(
		CardComponent,
		query.card.is(EvilXisumaBoss),
		query.card.currentPlayer,
	)
	const attackType = game.state.turn.availableActions.find(
		(action) => action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK',
	)
	if (bossCard === null) throw new Error('Boss card not found to attack with')
	if (attackType === undefined) throw new Error('Boss can not attack right now')
	supplyBossAttack(bossCard, attack)
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayerEntity,
		action: {
			type: attackType,
		},
	})
}

export function testReplayGame(options: {
	gameSaga: (con: GameController) => any
	afterGame: (con: GameController) => any
	playerOneDeck: Array<Card>
	playerTwoDeck: Array<Card>
	seed?: string
	shuffleDeck?: boolean
}) {
	const controller = new GameController(
		getTestPlayer('playerOne', options.playerOneDeck),
		getTestPlayer('playerTwo', options.playerTwoDeck),
		{
			randomizeOrder: true,
			// The default seed always ensures player one goes first. Because how replays work, turn order needs to be random here
			randomSeed: options.seed ? options.seed : '1234567',
			settings: {
				...defaultGameSettings,
				shuffleDeck: options.shuffleDeck || false,
				verboseLogging: false,
				forceCoinFlip: false,
				disableDeckOut: false,
				disableRewardCards: false,
			},
		},
	)

	testSagas(
		call(function* () {
			yield* call(gameSaga, controller)
		}),
		call(function* () {
			yield* call(options.gameSaga, controller)
		}),
	)

	const sagaMiddleware = getSagaMiddleware()

	const saga = sagaMiddleware.run(function* () {
		yield* call(options.afterGame, controller)
	})

	if (saga.error()) {
		throw saga.error()
	}
}
