import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {getActiveRow} from '../../../../server/utils'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class PotionOfWeaknessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_weakness',
			name: 'Potion of Weakness',
			rarity: 'common',
			description:
				"Opponent's active Hermit type is now weak to your active Hermit's type for 3 turns.",
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
		const {opponentPlayer} = pos
		const opponentActiveRow = getActiveRow(opponentPlayer)
		if (!opponentActiveRow) return
		opponentActiveRow.ailments.push({id: 'weakness', duration: 3})
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default PotionOfWeaknessSingleUseCard
