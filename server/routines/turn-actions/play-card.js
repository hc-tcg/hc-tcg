import CARDS from '../../cards'
import {equalCard} from '../../utils'

function* playCardSaga(game, turnAction, actionState) {
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer, opponentPlayer} = game.ds
	const {pastTurnActions, availableActions} = actionState
	const {card, rowHermitCard, rowIndex, slotIndex, slotType} =
		turnAction.payload
	const cardInfo = CARDS[card.cardId]
	// console.log('Playing card: ', card.cardId)

	if (!currentPlayer.hand.find((handCard) => equalCard(handCard, card)))
		return 'INVALID'

	// TODO - move logic to water/milk bucket plugins
	const suBucket =
		slotType === 'single_use' &&
		['water_bucket', 'milk_bucket'].includes(cardInfo.id)
	if (cardInfo.type !== slotType && !suBucket) return 'INVALID'

	if (cardInfo.type === 'hermit') {
		if (rowHermitCard) return
		if (!currentPlayer.board.rows[rowIndex]) return
		if (currentPlayer.board.rows[rowIndex].hermitCard) return
		if (!availableActions.includes('ADD_HERMIT')) return

		const result = game.hooks.playCard
			.get('hermit')
			?.call(turnAction, actionState)
		if (result === 'INVALID') return

		currentPlayer.board.rows[rowIndex] = {
			...currentPlayer.board.rows[rowIndex],
			hermitCard: card,
			health: cardInfo.health,
		}
		if (currentPlayer.board.activeRow === null) {
			currentPlayer.board.activeRow = rowIndex
		}
		pastTurnActions.push('ADD_HERMIT')
	} else if (cardInfo.type === 'item') {
		if (!rowHermitCard) return
		const hermitRow = currentPlayer.board.rows.find((row) =>
			equalCard(row.hermitCard, rowHermitCard)
		)
		if (!hermitRow) return
		if (hermitRow.itemCards[slotIndex] !== null) return
		if (!availableActions.includes('PLAY_ITEM_CARD')) return

		const result = game.hooks.playCard
			.get('item')
			?.call(turnAction, actionState)
		if (result === 'INVALID') return

		hermitRow.itemCards[slotIndex] = card
		pastTurnActions.push('PLAY_ITEM_CARD')
	} else if (cardInfo.type === 'effect' && !suBucket) {
		if (!rowHermitCard) return
		const hermitRow = currentPlayer.board.rows.find((row) =>
			equalCard(row.hermitCard, rowHermitCard)
		)
		if (!hermitRow) return
		if (hermitRow.effectCard) return
		if (!availableActions.includes('PLAY_EFFECT_CARD')) return

		const result = game.hooks.playCard
			.get('effect')
			?.call(turnAction, actionState)
		if (result === 'INVALID') return

		hermitRow.effectCard = card
		pastTurnActions.push('PLAY_EFFECT_CARD')
	} else if (cardInfo.type === 'single_use' || suBucket) {
		const targetRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
		if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) return
		if (currentPlayer.board.singleUseCard) return

		const result = game.hooks.playCard
			.get('single_use')
			?.call(turnAction, actionState)
		if (result === 'INVALID') return

		currentPlayer.board.singleUseCard = card
		pastTurnActions.push('PLAY_SINGLE_USE_CARD')
	}

	currentPlayer.hand = currentPlayer.hand.filter(
		(handCard) => !equalCard(handCard, card)
	)

	return 'DONE'
}

export default playCardSaga
