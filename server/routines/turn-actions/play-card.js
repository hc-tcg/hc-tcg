import CARDS from '../../cards'
import {equalCard} from '../../utils'

function* playCardSaga(action, state) {
	const {currentPlayer, opponentPlayer, pastTurnActions, availableActions} =
		state
	const {card, rowHermitCard, rowIndex, slotIndex} = action.payload
	const cardInfo = CARDS[card.cardId]
	console.log('Playing card: ', card.cardId)

	if (!currentPlayer.hand.find((handCard) => equalCard(handCard, card))) return

	if (cardInfo.type === 'hermit') {
		if (rowHermitCard) return
		if (!currentPlayer.board.rows[rowIndex]) return
		if (currentPlayer.board.rows[rowIndex].hermitCard) return
		if (!availableActions.includes('ADD_HERMIT')) return
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
		hermitRow.itemCards[slotIndex] = card
		pastTurnActions.push('PLAY_ITEM_CARD')
	} else if (cardInfo.type === 'effect') {
		if (!rowHermitCard) return
		const hermitRow = currentPlayer.board.rows.find((row) =>
			equalCard(row.hermitCard, rowHermitCard)
		)
		if (!hermitRow) return
		if (hermitRow.effectCard) return
		if (!availableActions.includes('PLAY_EFFECT_CARD')) return
		hermitRow.effectCard = card
		pastTurnActions.push('PLAY_EFFECT_CARD')
	} else if (cardInfo.type === 'single_use') {
		// TODO - dont apply single_use card on effect slot (or any other row slot)
		// TODO - INFO - fire/poison damage is applied first when it is used and then at the beginning of a turn of the player that use the effect
		// TODO - INFO - Golden Axe ignored totem of undying (that is it kills the opponent's hermit regardless)
		const targetRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
		if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) return
		if (currentPlayer.board.singleUseCard) return
		currentPlayer.board.singleUseCard = card
		pastTurnActions.push('PLAY_SINGLE_USE_CARD')
	}

	currentPlayer.hand = currentPlayer.hand.filter(
		(handCard) => !equalCard(handCard, card)
	)

	return 'DONE'
}

export default playCardSaga
