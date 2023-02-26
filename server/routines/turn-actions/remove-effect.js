function* removeEffectSaga(game, turnAction, actionState) {
	const {singleUseInfo, currentPlayer} = game.ds
	const {pastTurnActions} = actionState

	if (!singleUseInfo) return 'INVALID'
	if (currentPlayer.board.singleUseCardUsed) return 'INVALID'

	game.hooks.removeEffect.call(turnAction, actionState)

	// ideally we should not modify history, but this in this case it should be okay
	const sueIndex = pastTurnActions.findIndex(
		(value) => value === 'PLAY_SINGLE_USE_CARD'
	)
	if (sueIndex !== -1) pastTurnActions.splice(sueIndex, 1)
	currentPlayer.hand.push(currentPlayer.board.singleUseCard)
	currentPlayer.board.singleUseCard = null
	return 'DONE'
}

export default removeEffectSaga
