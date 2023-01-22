import CARDS from '../../cards'
import {equalCard} from '../../utils'

function* applyEffectSaga(turnAction, state) {
	// TODO - This shouldn't be needed
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer, opponentPlayer, gameState} = state
	const singleUseCard = currentPlayer.board.singleUseCard
	const singleUseInfo = singleUseCard ? CARDS[singleUseCard.cardId] : null
	const {singleUsePick} = turnAction.payload

	// Get active player hermit card for effects that affect active hermit
	const playerActiveRow =
		currentPlayer.board.activeRow !== null
			? currentPlayer.board.rows[currentPlayer.board.activeRow]
			: null
	const playerHermitCard = playerActiveRow ? playerActiveRow.hermitCard : null
	const playerHermitInfo = playerHermitCard
		? CARDS[playerHermitCard.cardId]
		: null

	// Get active opponent's hermit card for effects that affect opponent's active hermit
	const opponentActiveRow =
		opponentPlayer.board.activeRow !== null
			? opponentPlayer.board.rows[opponentPlayer.board.activeRow]
			: null
	const opponentHermitCard = opponentActiveRow
		? opponentActiveRow.hermitCard
		: null
	const opponentHermitInfo = opponentHermitCard
		? CARDS[opponentHermitCard.cardId]
		: null
	const opponentEffectCard = opponentActiveRow
		? opponentActiveRow.effectCard
		: null
	const opponentEffectCardInfo = opponentEffectCard
		? CARDS[opponentEffectCard.cardId]
		: null

	// Get picked hermit card for effects that affect selected hermit
	// NOTE - currently only player's hermits are supported
	const pickedPlayer = singleUsePick
		? gameState.players[singleUsePick.playerId]
		: null
	const pickedRow = pickedPlayer
		? pickedPlayer.board.rows[singleUsePick.rowIndex]
		: null
	const pickedCard = pickedRow?.hermitCard
	const pickedCardInfo = pickedCard ? CARDS[pickedCard.cardId] : null

	if (singleUseInfo.id === 'instant_health') {
		pickedRow.health = Math.min(
			pickedRow.health + 30,
			pickedCardInfo.health // max health
		)
	} else if (singleUseInfo.id === 'instant_health_ii') {
		pickedRow.health = Math.min(
			pickedRow.health + 60,
			pickedCardInfo.health // max health
		)
	} else if (singleUseInfo.id === 'golden_apple') {
		pickedRow.health = Math.min(
			pickedRow.health + 100,
			pickedCardInfo.health // max health
		)
	} else if (singleUseInfo.id === 'splash_potion_of_healing') {
		for (let row of currentPlayer.board.rows) {
			if (!row.hermitCard) continue
			const currentRowInfo = CARDS[row.hermitCard.cardId]
			if (!currentRowInfo) continue
			row.health = Math.min(row.health + 20, currentRowInfo.health)
		}
	} else if (singleUseInfo.id === 'splash_potion_of_poison') {
		if (opponentActiveRow === null) return 'INVALID'
		if (opponentEffectCardInfo?.id === 'milk_bucket') {
			// TODO - move to discard pile
			opponentActiveRow.effectCard = null
		} else {
			opponentActiveRow.ailments.push('poison')
		}
	} else if (singleUseInfo.id === 'lava_bucket') {
		if (opponentActiveRow === null) return 'INVALID'
		if (opponentEffectCardInfo?.id === 'water_bucket') {
			// TODO - move to discard pile
			opponentActiveRow.effectCard = null
		} else {
			opponentActiveRow.ailments.push('fire')
		}
	} else if (singleUseInfo.id === 'water_bucket') {
		if (pickedRow === null) return 'INVALID'
		pickedRow.ailments = pickedRow.ailments.filter((a) => a !== 'fire')
	} else if (singleUseInfo.id === 'milk_bucket') {
		if (pickedRow === null) return 'INVALID'
		pickedRow.ailments = pickedRow.ailments.filter((a) => a !== 'poison')
	} else if (singleUseInfo.id === 'clock') {
		// TODO - Message on FE
		if (gameState.turn < 2) return 'INVALID'
		// skip turn logic in turn cycle
	} else {
		return 'INVALID'
	}

	currentPlayer.board.singleUseCardUsed = true
}

export default applyEffectSaga
