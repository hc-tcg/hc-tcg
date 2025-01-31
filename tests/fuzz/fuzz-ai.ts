import {AIComponent} from 'common/components/ai-component'
import {GameModel} from 'common/models/game-model'
import { TurnAction } from 'common/types/game-state'

function getNextTurnAction(game: GameModel, component: AIComponent): TurnAction {
	let availableActions = game.state.turn.availableActions

	if (availableActions.length === 0) {
		throw new Error(
			'There should never be a state in the game where there are no available actions',
		)
	}


	if (availableActions.length === 1 && availableActions.includes('PLAY_HERMIT_CARD')) {
		return {
			type: 'PLAY_HERMIT_CARD',

		}



	}

	
}

const FuzzAI: AIComponent = {
	id: 'fuzz_ai',

	getTurnActions: function* (game, component) {
		while (true) {
			yield* getNextTurnAction(game, component)
		}
	},
}
