import {BoardSlotComponent, CardComponent} from 'common/components'
import {AIComponent} from 'common/components/ai-component'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {AnyTurnActionData} from 'common/types/turn-action-data'
import {VirtualAI} from 'common/types/virtual-ai'
import {getLocalCard} from 'server/utils/state-gen'
import {choose} from './utils'

function getNextTurnAction(
	game: GameModel,
	component: AIComponent,
): AnyTurnActionData {
	const {player} = component
	let availableActions = game.state.turn.availableActions

	if (availableActions.length === 0) {
		throw new Error(
			'There should never be a state in the game where there are no available actions',
		)
	}

	if (availableActions.includes('END_TURN')) {
		return {
			type: 'END_TURN',
		}
	}

	if (
		availableActions.length === 1 &&
		availableActions.includes('PLAY_HERMIT_CARD')
	) {
		const slot = choose(
			game.components.filter(
				BoardSlotComponent,
				query.slot.player(player.entity),
				query.slot.hermit,
			),
			game.rng,
		)
		const card = choose(
			game.components.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hand),
			),
			game.rng,
		)

		return {
			type: 'PLAY_HERMIT_CARD',
			slot: slot.entity,
			card: getLocalCard(game, card),
		}
	}

	throw new Error('Should never reach here')
}

export const FuzzAI: VirtualAI = {
	id: 'fuzz_ai',
	getTurnActions: function* (game, component) {
		while (true) {
			yield getNextTurnAction(game, component)
		}
	},
}
