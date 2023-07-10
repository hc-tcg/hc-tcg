import SingleUseCard from './_single-use-card'
import {HERMIT_CARDS} from '../../index'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class SplashPotionOfHealingIISingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing_ii',
			name: 'Splash Potion of Healing II',
			rarity: 'rare',
			description: 'Heal each of your active and AFK Hermits 30hp.',
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
		const {player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			for (let row of player.board.rows) {
				if (!row.hermitCard) continue
				const currentRowInfo = HERMIT_CARDS[row.hermitCard.cardId]
				if (!currentRowInfo) continue
				row.health = Math.min(row.health + 30, currentRowInfo.health)
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default SplashPotionOfHealingIISingleUseCard
