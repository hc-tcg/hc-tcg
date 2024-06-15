import {GameModel} from 'common/models/game-model'
import {ActionResult, CardT, PlayerState} from 'common/types/game-state'
import {RequestPlayableSlotsData} from 'common/types/action-data'
import {CARDS} from 'common/cards'
import {PickedSlotType, SlotDisplayPosition} from 'common/types/server-requests'

export function* playableSlotsRequestSaga(
	game: GameModel,
	payload: RequestPlayableSlotsData
): Generator<any, ActionResult> {
	const playerState = game.state.players[game.currentPlayer.id]

	let card = payload.payload.card
	let cardObj = CARDS[card.cardId]

	let pickableSlots: Array<SlotDisplayPosition> = []

	for (const player of Object.values(game.state.players)) {
		for (let rowIndex = 0; rowIndex < playerState.board.rows.length; rowIndex++) {
			const row = playerState.board.rows[rowIndex]

			const appendCanBeAttachedTo = (type: PickedSlotType, card: CardT | null) => {
				const canBeAttached = cardObj.canBeAttachedTo(game, {
					player: player,
					type: type,
					rowIndex: rowIndex,
					row: row,
					card: card,
				})
				if (canBeAttached) {
					pickableSlots.push({
						type: type,
						rowIndex: rowIndex,
						playerId: player.id,
					})
				}
			}

			appendCanBeAttachedTo('effect', row.effectCard)
			appendCanBeAttachedTo('hermit', row.hermitCard)
			for (const item in row.itemCards) {
				appendCanBeAttachedTo('item', row.itemCards[item])
			}
		}

		if (
			cardObj.canBeAttachedTo(game, {
				player,
				type: 'single_use',
				rowIndex: null,
				row: null,
				card: player.board.singleUseCard,
			})
		) {
			pickableSlots.push({
				playerId: player.id,
				type: 'single_use',
			})
		}
	}

	playerState.pickableSlots = pickableSlots

	return 'SUCCESS'
}

export function* deselectCardSaga(game: GameModel): Generator<any, ActionResult> {
	const playerState = game.state.players[game.currentPlayer.id]
	playerState.pickableSlots = null
	return 'SUCCESS'
}
