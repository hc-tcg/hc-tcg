import {GameModel} from '../../../../server/models/game-model'
import EffectCard from './_effect-card'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class DiamondArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'diamond_armor',
			name: 'Diamond Armor',
			rarity: 'rare',
			description:
				'Prevent up to 20hp damage taken.\n\nAlso prevents additional damage to this Hermit from all effect cards.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {otherPlayer, player} = pos
		const instanceKey = this.getInstanceKey(instance)

		otherPlayer.hooks.onAttack[instance] = (attack, pickedSlots) => {
			if (attack.target.index !== pos.rowIndex || attack.type === 'ailment')
				return
			if (attack.type === 'effect') {
				attack.reduceDamage(attack.damage)
				attack.lockDamage()
				return
			}

			if (player.custom[instanceKey] === undefined) {
				player.custom[instanceKey] = 0
			}

			const totalReduction = player.custom[instanceKey]

			if (totalReduction < 20) {
				const damageReduction = Math.min(attack.damage, 20 - totalReduction)
				player.custom[instanceKey] += damageReduction
				attack.reduceDamage(damageReduction)
			}
		}

		otherPlayer.hooks.turnEnd[instance] = () => {
			delete player.custom[instanceKey]
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
		delete otherPlayer.hooks.turnEnd[instance]
		delete player.custom[this.getInstanceKey(instance)]
	}
}

export default DiamondArmorEffectCard
