import {Attach, Card, Hermit, Item, SingleUse} from 'common/cards/base/types'
import {PlayerComponent, SlotComponent} from 'common/components'
import query, {ComponentQuery} from 'common/components/query'
import {GameModel, GameSettings} from 'common/models/game-model'
import { SlotTypeT } from 'common/types/cards'
<<<<<<< HEAD
=======
import {CardCategoryT} from 'common/types/cards'
>>>>>>> 9baf7c1d (Fix evil X)
import {LocalModalResult} from 'common/types/server-requests'
import {
	attackToAttackAction,
	slotToPlayCardAction,
} from 'common/types/turn-action-data'
import {applyMiddleware, createStore} from 'redux'
import createSagaMiddleware from 'redux-saga'
import {LocalMessage, localMessages} from 'server/messages'
import gameSaga from 'server/routines/game'
import {getLocalCard} from 'server/utils/state-gen'
import {call, put, race} from 'typed-redux-saga'

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
): any
export function playCardFromHand(
	game: GameModel,
	card: Item,
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
		playerEntity: game.currentPlayer.entity,
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
		playerEntity: game.currentPlayer.entity,
		action: {
			type: 'MODAL_REQUEST',
			modalResult,
		},
	})
}

function testSagas(rootSaga: any, testingSaga: any) {
	const sagaMiddleware = createSagaMiddleware({
		// Prevent default behavior where redux saga logs errors to stderr. This is not useful to tests.
		onError: (_err, {sagaStack: _}) => {},
	})
	createStore(() => {}, applyMiddleware(sagaMiddleware))
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
	disableDamage: false,
	noItemRequirements: false,
	forceCoinFlip: false,
	shuffleDeck: false,
	logErrorsToStderr: false,
	logBoardState: true,
}

/**
 * Test a saga against a game. The game is created with default settings similar to what would be found in production.
 * Note that decks are not shuffled in test games.
 */
export function testGame(
	options: {
		saga: any
		playerOneDeck: Array<Card>
		playerTwoDeck: Array<Card>
	},
	settings: Partial<GameSettings> = {},
) {
	let game = new GameModel(
		getTestPlayer('playerOne', options.playerOneDeck),
		getTestPlayer('playerTwo', options.playerTwoDeck),
		{
			...defaultGameSettings,
			...settings,
		},
		{randomizeOrder: false},
	)

	testSagas(call(gameSaga, game), call(options.saga, game))
}
