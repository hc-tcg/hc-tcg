import {Card} from 'common/cards/base/types'
import {CardComponent, PlayerComponent, SlotComponent} from 'common/components'
import {GameModel, GameSettings} from 'common/models/game-model'
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

export function getTestPlayer(playerName: string, deck: Array<Card>) {
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

export function* endTurn(game: GameModel) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: 'END_TURN',
		},
	})
}

export function* playCard(
	game: GameModel,
	card: CardComponent,
	slot: SlotComponent,
) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: slotToPlayCardAction[card.props.category],
			card: getLocalCard(game, card),
			slot: slot.entity,
		},
	})
}

export function* applyEffect(game: GameModel) {
	yield* put<LocalMessage>({
		type: localMessages.GAME_TURN_ACTION,
		playerEntity: game.currentPlayer.entity,
		action: {
			type: 'APPLY_EFFECT',
		},
	})
}

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

function testSagas(rootSaga: any, testingSaga: any) {
	const sagaMiddleware = createSagaMiddleware()
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
		enabled: true,
		clearConsole: false,
	},
	blockedActions: [],
	availableActions: [],
	autoEndTurn: false,
	disableDeckOut: true,
	startWithAllCards: true,
	unlimitedCards: false,
	oneShotMode: false,
	disableDamage: false,
	noItemRequirements: true,
}

/** Test a saga against a game. The game is created with sane default settings.
 * Test games will put all cards in your hand to begin with and do not allow players
 * deck out. Additionally item requirements are disabbledd.
 * These defaults are chosen because it makes it the easiest to verify card interactions.
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
		getTestPlayer('player1', options.playerOneDeck),
		getTestPlayer('player2', options.playerTwoDeck),
		{
			...defaultGameSettings,
			...settings,
		},
		{randomizeOrder: false},
	)

	testSagas(call(gameSaga, game), call(options.saga, game))
}
