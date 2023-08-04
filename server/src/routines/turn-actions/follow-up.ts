import {GameModel} from 'common/models/game-model'
import {PickedSlots} from 'common/types/pick-process'

// @TODO not using new actionResult system for this because follow up confuses me and I want to get rid of it anyways - Sense

function* followUpSaga(game: GameModel, pickedSlots: PickedSlots, modalResult: any) {
	const {currentPlayer, opponentPlayer} = game
	for (const player of [currentPlayer, opponentPlayer]) {
		if (Object.keys(player.followUp).length === 0) continue

		for (const followUp of Object.keys(player.followUp)) {
			player.hooks.onFollowUp.call(followUp, pickedSlots, modalResult)
		}
	}
}

export default followUpSaga
