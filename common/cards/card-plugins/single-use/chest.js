import SingleUseCard from './_single-use-card'
import {equalCard, retrieveCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class ChestSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chest',
			name: 'Chest',
			rarity: 'rare',
			description:
				'Look through your discard pile and select 1 card to return to your hand.\n\nCan not return "Clock" to your hand.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			/** @type {CardT | undefined} */
			const card = modalResult.card
			if (!card || card.cardId === 'clock') return

			retrieveCard(game, card)
		}
	}

	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}
}

export default ChestSingleUseCard
