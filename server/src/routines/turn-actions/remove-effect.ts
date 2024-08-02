import {CardComponent} from "common/components"
import query from "common/components/query"
import {GameModel} from "common/models/game-model"
import {GenericActionResult} from "common/types/game-state"

function* removeEffectSaga(
	game: GameModel,
): Generator<never, GenericActionResult> {
	let singleUseCard = game.components.find(
		CardComponent,
		query.card.slot(query.slot.singleUse),
	)

	game.cancelPickRequests()

	// Remove current attack
	if (game.state.turn.currentAttack) {
		game.state.turn.currentAttack = null
	}

	singleUseCard?.draw()

	return "SUCCESS"
}

export default removeEffectSaga
