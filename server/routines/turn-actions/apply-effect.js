import CARDS from '../../cards'
import {getPickedCardsInfo} from '../../utils'

// TODO - You can "apply effect" by putting on in the slot, then selecting another clicking the sotteded one and confirmiing modal
function* applyEffectSaga(game, turnAction, derivedState) {
	// TODO - This shouldn't be needed
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer, opponentPlayer} = derivedState
	const singleUseCard = currentPlayer.board.singleUseCard
	const singleUseInfo = singleUseCard ? CARDS[singleUseCard.cardId] : null
	const {pickedCards} = turnAction.payload

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

	const pickedCardsInfo = getPickedCardsInfo(game.state, pickedCards)

	if (!singleUseInfo) return 'INVALID'
	const applyEffectResult = game.hooks.applyEffect.call(turnAction, {
		...derivedState,
		pickedCardsInfo,
		singleUseInfo,
		playerActiveRow,
		opponentActiveRow,
		opponentEffectCardInfo,
	})

	if (applyEffectResult !== 'DONE') {
		if (applyEffectResult === 'INVALID') {
			console.log('Validation failed for: ', singleUseInfo?.id)
		} else {
			console.log('Effect not implemented: ', singleUseInfo?.id)
		}
		return 'INVALID'
	}

	currentPlayer.board.singleUseCardUsed = true
}

export default applyEffectSaga
