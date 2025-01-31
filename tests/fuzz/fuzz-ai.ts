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

	// We need to play a hermit card at the start of every game.
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

	let nextAction = choose(availableActions, game.rng)

	if (nextAction === 'END_TURN') {
		return {
			type: 'END_TURN',
		}
	}

	if (nextAction === 'PLAY_HERMIT_CARD') {
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
				query.card.isHermit,
			),
			game.rng,
		)

		return {
			type: 'PLAY_HERMIT_CARD',
			slot: slot.entity,
			card: getLocalCard(game, card),
		}
	}

	if (nextAction === 'PLAY_EFFECT_CARD') {
		const slot = choose(
			game.components.filter(
				BoardSlotComponent,
				query.slot.player(player.entity),
				query.slot.attach,
				query.slot.row(query.row.hasHermit),
			),
			game.rng,
		)

		const card = choose(
			game.components.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hand),
				query.card.isAttach,
			),
			game.rng,
		)

		return {
			type: 'PLAY_EFFECT_CARD',
			slot: slot.entity,
			card: getLocalCard(game, card),
		}
	}

	if (nextAction === 'PLAY_ITEM_CARD') {
		const slot = choose(
			game.components.filter(
				BoardSlotComponent,
				query.slot.player(player.entity),
				query.slot.item,
				query.slot.row(query.row.hasHermit),
			),
			game.rng,
		)

		const card = choose(
			game.components.filter(
				CardComponent,
				query.card.player(player.entity),
				query.card.slot(query.slot.hand),
				query.card.isItem,
			),
			game.rng,
		)

		return {
			type: 'PLAY_ITEM_CARD',
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
