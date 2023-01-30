import CARDS from '../../cards'
import {getDerivedState} from '../../utils/derived-state'

function* followUpSaga(game, turnAction, baseDerivedState) {
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer} = baseDerivedState
	const derivedState = getDerivedState(game, turnAction, baseDerivedState)
	const {followUp} = currentPlayer

	if (!followUp) return 'INVALID'

	const followUpResult = game.hooks.followUp.call(turnAction, {
		...derivedState,
		followUp,
	})

	if (followUpResult === 'INVALID') {
		console.log('Validation failed for: ', followUp)
		return 'INVALID'
	} else if (followUpResult === 'DONE') {
		delete currentPlayer.followUp
		return 'DONE'
	} else if (followUpResult) {
		currentPlayer.followUp = followUpResult
		return 'NEXT'
	}
	console.log('Followup not implemented: ', followUp)
	return 'INVALID'
}

export default followUpSaga
