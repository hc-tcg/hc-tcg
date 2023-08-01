import {GameModel} from 'common/models/game-model'

function* followUpSaga(game: GameModel, turnAction: any, actionState: any) {
	const {currentPlayer, opponentPlayer: opponentPlayer} = game
	const {pickedSlots, modalResult} = actionState
	for (const player of [currentPlayer, opponentPlayer]) {
		if (Object.keys(player.followUp).length === 0) continue
		for (const followUp of Object.keys(player.followUp)) {
			player.hooks.onFollowUp.call(followUp, pickedSlots, modalResult)
		}
	}
}

export default followUpSaga
