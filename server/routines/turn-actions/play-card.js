import CARDS from '../../cards'
import {equalCard} from '../../utils'
import {checkAttachReq} from '../../utils/reqs'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 */

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @param {ActionState} actionState
 * @return {SagaIterator}
 */
function* playCardSaga(game, turnAction, actionState) {
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer} = game.ds
	const {pastTurnActions, availableActions} = actionState
	const {card, rowHermitCard, rowIndex, slotIndex, slotType, playerId} =
		turnAction.payload
	const cardInfo = CARDS[card.cardId]

	if (!currentPlayer.hand.find((handCard) => equalCard(handCard, card)))
		return 'INVALID'

	if (!checkAttachReq(game.state, turnAction.payload, cardInfo.attachReq))
		return 'INVALID'

	const player = game.state.players[playerId]
	if (!player) return 'INVALID'

	const validate = (type) =>
		game.hooks.validateCard.get(type)?.call(turnAction, actionState)

	if (slotType === 'hermit') {
		if (!availableActions.includes('ADD_HERMIT')) return
		if (validate('hermit') === 'INVALID') return
		const row = player.board.rows[rowIndex]
		row.hermitCard = card
		if (cardInfo.type === 'hermit') {
			row.health = cardInfo.health
			if (player.board.activeRow === null) {
				player.board.activeRow = rowIndex
			}
			pastTurnActions.push('ADD_HERMIT')
		}
	} else if (slotType === 'item') {
		const isItem = cardInfo.type === 'item'
		if (isItem && !availableActions.includes('PLAY_ITEM_CARD')) return
		if (!isItem && !availableActions.includes('PLAY_EFFECT_CARD')) return
		const hermitRow = player.board.rows.find((row) =>
			equalCard(row.hermitCard, rowHermitCard)
		)
		if (!hermitRow) return
		if (validate('item') === 'INVALID') return

		hermitRow.itemCards[slotIndex] = card

		pastTurnActions.push(isItem ? 'PLAY_ITEM_CARD' : 'PLAY_EFFECT_CARD')
	} else if (slotType === 'effect') {
		if (!availableActions.includes('PLAY_EFFECT_CARD')) return
		const hermitRow = player.board.rows.find((row) =>
			equalCard(row.hermitCard, rowHermitCard)
		)
		if (!hermitRow) return
		if (validate('effect') === 'INVALID') return

		hermitRow.effectCard = card
		pastTurnActions.push('PLAY_EFFECT_CARD')
	} else if (slotType === 'single_use') {
		if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) return
		if (player.board.singleUseCard) return
		if (validate('single_use') === 'INVALID') return

		player.board.singleUseCard = card
		pastTurnActions.push('PLAY_SINGLE_USE_CARD')
	}

	currentPlayer.hand = currentPlayer.hand.filter(
		(handCard) => !equalCard(handCard, card)
	)

	game.hooks.playCard.get(slotType)?.call(turnAction, actionState)

	return 'DONE'
}

export default playCardSaga
