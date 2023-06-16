import SingleUseCard from './_single-use-card'
import {HERMIT_CARDS} from '../../index'
import {GameModel} from '../../../../server/models/game-model'

/**
* @typedef {import('common/types/cards').CardPos} CardPos
* @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
*/

class SplashPotionOfHealingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing',
			name: 'Splash Potion of Healing',
			rarity: 'common',
			description:
				"Heal each of your active and AFK Hermits 20hp.",
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		for (let row of pos.player.board.rows) {
			if (!row.hermitCard) continue
			const currentRowInfo = HERMIT_CARDS[row.hermitCard.cardId]
			if (!currentRowInfo) continue
			row.health = Math.min(row.health + 20, currentRowInfo.health)
		}
	}
}

export default SplashPotionOfHealingSingleUseCard
