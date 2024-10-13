import {getLocalCard} from 'client/logic/game/local-state'
import {Card} from 'common/cards/base/types'
import EvilXisumaBossHermitCard, {
	BOSS_ATTACK,
	supplyBossAttack,
} from 'common/cards/boss/hermits/evilxisuma_boss'
import {
	BoardSlotComponent,
	CardComponent,
	PlayerComponent,
	RowComponent,
	SlotComponent,
} from 'common/components'
import query, {ComponentQuery} from 'common/components/query'
import {PlayerEntity} from 'common/entities'
import {GameModel, GameSettings} from 'common/models/game-model'
import gameSaga, {
	gameMessages,
	GameMessageTable,
	runGameSaga,
} from 'common/routines/game'
import {SlotTypeT} from 'common/types/cards'
import {GameOutcome} from 'common/types/game-state'
import {LocalModalResult} from 'common/types/server-requests'
import {
	attackToAttackAction,
	slotToPlayCardAction,
} from 'common/types/turn-action-data'
import {assert} from 'common/utils/assert'
import {applyMiddleware, createStore} from 'redux'
import createSagaMiddleware from 'redux-saga'
import {GameMessage} from 'server/messages'
import {call, cancel, fork, put, take} from 'typed-redux-saga'

function getTestPlayer(playerName: string, deck: Array<Card>) {
	return {
		model: {
			name: playerName,
			minecraftName: playerName,
			censoredName: playerName,
		},
		deck,
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
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		time: Date.now(),
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
): any
export function playCardFromHand(
	game: GameModel,
	card: Card,
	slotType: 'item',
	row: number,
	index: number,
): any
export function* playCardFromHand(
	game: GameModel,
	card: Card,
	slotType: SlotTypeT,
	row?: number,
	index?: number,
) {
	let cardComponent = findCardInHand(game.currentPlayer, card)

	const slot = game.components.find(
		SlotComponent,
		query.slot.currentPlayer,
		(_game, slot) =>
			(!slot.inRow() && index === undefined) ||
			(slot.inRow() && slot.row.index === row),
		(_game, slot) =>
			index === undefined || (slot.inRow() && slot.index === index),
		(_game, slot) => slot.type === slotType,
	)!

	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		time: Date.now(),
		action: {
			type: slotToPlayCardAction[cardComponent.props.category],
			card: getLocalCard(game, cardComponent),
			slot: slot.entity,
		},
	})
}

/** Apply the effect card in the single use slot. This should be used to apply status effects that use the "should apply" modal. */
export function* applyEffect(game: GameModel) {
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		time: Date.now(),
		action: {
			type: 'APPLY_EFFECT',
		},
	})
}

/** Removes the effect card in the single use slot. This should be used to cancel effects that use the "should apply" modal or cancel an attack with pick requests. */
export function* removeEffect(game: GameModel) {
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		time: Date.now(),
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
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		time: Date.now(),
		action: {
			type: attackToAttackAction[attack],
		},
	})
}

/** Change the active hermit row for the current player. */
export function* changeActiveHermit(game: GameModel, index: number) {
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		time: Date.now(),
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
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.state.pickRequests[0].player,
		time: Date.now(),
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
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.state.modalRequests[0].player,
		time: Date.now(),
		action: {
			type: 'MODAL_REQUEST',
			modalResult,
		},
	})
}
export function* timeout(game: GameModel) {
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.currentPlayerEntity,
		time: Date.now(),
		action: {
			type: 'TIMEOUT',
		},
	})
}

export function* forfeit(player: PlayerEntity) {
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: player,
		time: Date.now(),
		action: {
			type: 'FORFEIT',
			player,
		},
	})
}

function testSaga(testSaga: any) {
	const sagaMiddleware = createSagaMiddleware({
		// Prevent default behavior where redux saga logs errors to stderr. This is not useful to tests.
		onError: (_err, {sagaStack: _}) => {},
	})
	createStore(() => {}, applyMiddleware(sagaMiddleware))

	let saga = sagaMiddleware.run(function* () {
		yield* testSaga
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
	logBoardState: true,
	disableRewardCards: false,
	waitForCoinFlips: false,
} satisfies GameSettings

export function getWinner(
	game: GameModel,
	outcome: GameOutcome,
): PlayerComponent | null {
	if (outcome === 'tie') return null
	return game.components.find(
		PlayerComponent,
		(_game, component) => component.entity === outcome.winner,
	)
}

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
	let gameProps = {
		player1: getTestPlayer('playerOne', options.playerOneDeck),
		player2: getTestPlayer('playerTwo', options.playerTwoDeck),
		settings: {...defaultGameSettings, ...settings},
		randomNumberSeed: 'Consistent Seed for Test Games',
		randomizeOrder: false,
	}

	let testEnded = false

	testSaga(
		call(function* () {
			let gameSagaTask: any
			gameSagaTask = yield* fork(() =>
				runGameSaga(gameProps, {
					onGameStart: function* (game) {
						yield* fork(function* () {
							yield* call(options.saga, game)

							testEnded = true

							if (options.then) {
								let outcome = (yield* take(
									gameMessages.GAME_END,
								)) as GameMessageTable[typeof gameMessages.GAME_END]
								assert(outcome.type, gameMessages.GAME_END)

								options.then(game, outcome.outcome)
							}

							yield* cancel(gameSagaTask)
						})
					},
				}),
			)
		}),
	)

	if (!options.then && !testEnded) {
		throw new Error('Game was ended before the test finished running.')
	}
}

/**
 * Works similarly to `testGame`, but for testing the Evil X boss fight
 */
export function testBossFight(
	options: {
		/**
		 * @example
		 * {
		 * 	...
		 * 	yield* endTurn(game)
		 * 	// Boss' first turn
		 * 	yield* playCardFromHand(game, EvilXisumaBossHermitCard, 'hermit', 0)
		 * 	yield* bossAttack(game, '50DMG')
		 * 	...
		 * }
		 */
		saga: (game: GameModel) => any
		// This is the place to check the state of the game after it ends.
		then?: (game: GameModel) => any
		playerDeck: Array<Card>
	},
	settings?: Partial<GameSettings>,
) {
	let game = new GameModel(
		getTestPlayer('playerOne', options.playerDeck),
		{
			model: {
				name: 'Evil Xisuma',
				censoredName: 'Evil Xisuma',
				minecraftName: 'EvilXisuma',
				disableDeckingOut: true,
			},
			deck: [EvilXisumaBossHermitCard],
		},
		{...defaultGameSettings, ...settings, disableRewardCards: true},
		{randomizeOrder: false},
	)

	game.state.isBossGame = true

	function destroyRow(row: RowComponent) {
		game.components
			.filterEntities(BoardSlotComponent, query.slot.rowIs(row.entity))
			.forEach((slotEntity) => game.components.delete(slotEntity))
		game.components.delete(row.entity)
	}

	// Remove challenger's rows other than indexes 0, 1, and 2
	game.components
		.filter(
			RowComponent,
			query.row.opponentPlayer,
			(_game, row) => row.index > 2,
		)
		.forEach(destroyRow)
	// Remove boss' rows other than index 0
	game.components
		.filter(
			RowComponent,
			query.row.currentPlayer,
			query.not(query.row.index(0)),
		)
		.forEach(destroyRow)
	// Remove boss' item slots
	game.components
		.filterEntities(
			BoardSlotComponent,
			query.slot.currentPlayer,
			query.slot.item,
		)
		.forEach((slotEntity) => game.components.delete(slotEntity))

	let testEnded = false

	testSagas(
		call(function* () {
			yield* call(gameSaga, game)
		}),
		call(function* () {
			yield* call(options.saga, game)
			testEnded = true
		}),
	)

	if (!options.then && !testEnded) {
		throw new Error('Game was ended before the test finished running.')
	}

	if (options.then) options.then(game)
}

export function* bossAttack(game: GameModel, ...attack: BOSS_ATTACK) {
	const bossCard = game.components.find(
		CardComponent,
		query.card.is(EvilXisumaBossHermitCard),
		query.card.currentPlayer,
	)
	const attackType = game.state.turn.availableActions.find(
		(action) => action === 'PRIMARY_ATTACK' || action === 'SECONDARY_ATTACK',
	)
	if (bossCard === null) throw new Error('Boss card not found to attack with')
	if (attackType === undefined) throw new Error('Boss can not attack right now')
	supplyBossAttack(bossCard, attack)
	yield* put<GameMessage>({
		type: gameMessages.TURN_ACTION,
		playerEntity: game.currentPlayerEntity,
		action: {
			type: attackType,
		},
	})
}
