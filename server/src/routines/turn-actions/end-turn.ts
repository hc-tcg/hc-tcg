import {CardComponent} from 'common/components'
import {GameModel} from 'common/models/game-model'
import {GenericActionResult} from 'common/types/game-state'
import * as query from 'common/components/query'

function* endTurnSaga(game: GameModel): Generator<never, GenericActionResult> {
	let singleUseCard = game.components.find(
		CardComponent,
		query.card.onBoard,
		query.card.isSingleUse
	)

	if (!game.currentPlayer.singleUseCardUsed) singleUseCard?.draw()

	game.currentPlayer.singleUseCardUsed = false
	
	return 'SUCCESS'
}

export default endTurnSaga
