import {describe, expect, test} from '@jest/globals'
import {testGame} from '../unit/game/utils'
import EthosLabCommon from 'common/cards/default/hermits/ethoslab-common'
import {GameModel} from 'common/models/game-model'
import {
	turnActionToBuffer,
	bufferToTurnActions,
} from 'common/utils/turn-action-compressor'
import {
	AnyTurnActionData,
	PlayCardActionData,
} from 'common/types/turn-action-data'
import {BoardSlotComponent} from 'common/components'
import query from 'common/components/query'
import {LocalMessage, localMessages} from 'server/messages'
import {put} from 'typed-redux-saga'
import {
	LocalModalData,
	LocalSelectCards,
	WithoutFunctions,
} from 'common/types/server-requests'
import {SelectCards} from 'common/types/modal-requests'

describe('Test Turn Action Compressor', () => {
	test('Placing Cards', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				saga: function* (game: GameModel) {
					const slot = game.components.find(
						BoardSlotComponent,
						query.slot.player(game.currentPlayer.entity),
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					const playerHand = game.currentPlayer.getHand()
					const playerHandSlot = playerHand[0].slot
					if (!slot) return

					const action: PlayCardActionData = {
						type: 'PLAY_HERMIT_CARD',
						slot: slot.entity,
						card: {
							props: WithoutFunctions(playerHand[0].props),
							entity: playerHand[0].entity,
							slot: playerHandSlot.entity,
							turnedOver: false,
							attackHint: null,
						},
					}

					const compressedActions = turnActionToBuffer(game, action, 51000)
					console.log(compressedActions)
					const firstRetrievedAction = bufferToTurnActions(
						game,
						compressedActions,
					)[0]

					yield* put<LocalMessage>({
						type: localMessages.GAME_TURN_ACTION,
						playerEntity: game.currentPlayer.entity,
						action: firstRetrievedAction.action,
					})

					expect(slot.getCard()).not.toBe(null)
					expect(game.currentPlayer.getHand().length).toEqual(1)
					expect(firstRetrievedAction.millisecondsSinceLastAction).toEqual(
						51000,
					)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, logBoardState: false},
		)
	})

	test('Modal Test', () => {
		testGame(
			{
				playerOneDeck: [EthosLabCommon, EthosLabCommon],
				playerTwoDeck: [EthosLabCommon, EthosLabCommon],
				saga: function* (game: GameModel) {
					const slot = game.components.find(
						BoardSlotComponent,
						query.slot.player(game.currentPlayer.entity),
						query.slot.hermit,
						query.slot.rowIndex(0),
					)
					const playerHand = game.currentPlayer.getHand()
					const playerFirstCard = playerHand[0]
					if (!slot) return

					const result: LocalSelectCards.Result = {
						result: true,
						cards: [playerFirstCard.entity],
					}

					const compressedActions = turnActionToBuffer(
						game,
						{type: 'MODAL_REQUEST', modalResult: result},
						100,
					)
					console.log(compressedActions)
					const firstRetrievedAction = bufferToTurnActions(
						game,
						compressedActions,
					)[0]

					console.log(firstRetrievedAction)
				},
			},
			{startWithAllCards: true, noItemRequirements: true, logBoardState: false},
		)
	})
})
