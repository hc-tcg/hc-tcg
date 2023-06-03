// TODO - You can "apply effect" by putting it on in the slot, then selecting another clicking the slotteded one and confirmiing modal
function* applyEffectSaga(game, turnAction, actionState) {
	const {singleUseInfo, currentPlayer} = game.ds
	const {pickedSlotsInfo} = actionState

	if (!singleUseInfo) return 'INVALID'
	const cardInstance = currentPlayer.board.singleUseCard.cardInstance

	const applyEffectResult = singleUseInfo.onApply(game, cardInstance, pickedSlotsInfo)

	if (applyEffectResult === 'INVALID') {
		console.log('Validation failed for: ', singleUseInfo?.id)
		return 'INVALID'
	} else if (applyEffectResult === 'DONE') {
		currentPlayer.board.singleUseCardUsed = true
		return 'DONE'
	} else if (applyEffectResult) {
		currentPlayer.board.singleUseCardUsed = true
		currentPlayer.followUp = applyEffectResult
		return 'DONE'
	}

	console.log('Effect not implemented: ', singleUseInfo?.id)
	currentPlayer.followUp = null
	return 'INVALID'
}

export default applyEffectSaga
