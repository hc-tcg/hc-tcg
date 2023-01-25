import CARDS from '../../cards'
import {equalCard} from '../../utils'

function* applyEffectSaga(game, turnAction, derivedState) {
	// TODO - This shouldn't be needed
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer, opponentPlayer, gameState} = derivedState
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

	if (!singleUseInfo) return 'INVALID'
	const applyEffectResult = game.hooks.applyEffect.call(turnAction, {
		...derivedState,
		pickedRow,
		pickedCard,
		pickedCardInfo,
		singleUseInfo,
		opponentActiveRow,
		opponentEffectCardInfo,
	})

	if (applyEffectResult !== 'DONE') {
		console.log('Invalid effect: ', singleUseInfo?.id)
		return 'INVALID'
	}

	currentPlayer.board.singleUseCardUsed = true
}

export default applyEffectSaga
