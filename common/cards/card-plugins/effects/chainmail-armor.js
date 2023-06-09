import {GameModel} from '../../../../server/models/game-model'
import EffectCard from './_effect-card'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
*/

class ChainmailArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'chainmail_armor',
			name: 'Chainmail Armor',
			rarity: 'common',
			description:
				"Prevents damage from all effect cards.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {otherPlayer} = pos

		otherPlayer.hooks.onAttack[instance] = (attack, pickedSlots) => {
			if (attack.target.index !== pos.rowIndex || attack.type === 'ailment') return
			if (attack.type === 'effect') {
				attack.reduceDamage(attack.damage)
				return
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {otherPlayer, player} = pos
		delete otherPlayer.hooks.onAttack[instance]
	}
}

export default ChainmailArmorEffectCard
