import CARDS from '../../cards'

function* followUpSaga(game, turnAction, derivedState) {
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer} = derivedState
	const {followUp} = currentPlayer

	if (!followUp) return 'INVALID'

	const followUpResult = game.hooks.followUp.call(turnAction, {
		...derivedState,
		followUp,
	})

	if (followUpResult === 'INVALID') {
		console.log('Validation failed for: ', followUp)
		currentPlayer.followUp = null
		return 'INVALID'
	} else if (followUpResult === 'DONE') {
		currentPlayer.followUp = null
		return 'DONE'
	} else if (followUpResult) {
		currentPlayer.followUp = followUpResult
		return 'NEXT'
	}
	console.log('Followup not implemented: ', followUp)
	currentPlayer.followUp = null
	return 'INVALID'
}

export default followUpSaga
