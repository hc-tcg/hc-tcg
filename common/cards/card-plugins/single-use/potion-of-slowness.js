import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {getActiveRow} from '../../../../server/utils'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class PotionOfSlownessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_slowness',
			name: 'Potion of Slowness',
			rarity: 'common',
			description:
				"Opponent's active hermit can only use their primary attack on their next turn.",
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow) return
			opponentActiveRow.ailments.push({id: 'slowness', duration: 1})
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}
	getExpansion() {
		return 'alter_egos'
	}
}

export default PotionOfSlownessSingleUseCard
