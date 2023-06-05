import SingleUseCard from './_single-use-card'
import {HERMIT_CARDS} from '../../index'

/**
* @typedef {import('../../../../server/models/game-model').GameModel} GameModel
* @typedef {import('../../../types/cards').CardPos} CardPos
* @typedef {import('../../../types/pick-process').PickedSlotsInfo} PickedSlotsInfo
*/

class SplashPotionOfHealingIISingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing_ii',
			name: 'Splash Potion of Healing',
			rarity: 'common',
			description:
				"Heal each of your active and AFK Hermits 30hp.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'NO') return 'INVALID'

		const {playerActiveRow} = game.ds
		if (!playerActiveRow) return 'INVALID'

		return 'YES'
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {PickedSlotsInfo} pickedSlots
	 */
	onApply(game, instance, pickedSlots) {
		const {singleUseInfo, currentPlayer} = game.ds
		if (singleUseInfo?.id === this.id) {
			for (let row of currentPlayer.board.rows) {
				if (!row.hermitCard) continue
				const currentRowInfo = HERMIT_CARDS[row.hermitCard.cardId]
				if (!currentRowInfo) continue
				row.health = Math.min(row.health + 30, currentRowInfo.health)
			}
		}
	}
}

export default SplashPotionOfHealingIISingleUseCard
