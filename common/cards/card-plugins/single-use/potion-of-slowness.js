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
	onApply(game, instance, pos) {
		const {otherPlayer} = pos
		const opponentActiveRow = getActiveRow(otherPlayer)
		if (!opponentActiveRow) return
		opponentActiveRow.ailments.push({id: 'slowness', duration: 1})
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default PotionOfSlownessSingleUseCard
