import EffectCard from './_effect-card'
import {discardCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class ShieldEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'shield',
			name: 'Shield',
			rarity: 'common',
			description:
				'Prevent up to 60hp damage for 1 turn.\n\nDiscard following any damage taken.',
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

			if (player.custom[instanceKey] === undefined) {
				player.custom[instanceKey] = 0
			}

			const totalReduction = player.custom[instanceKey]

			if (totalReduction < 60) {
				const damageReduction = Math.min(attack.damage, 60 - totalReduction)
				player.custom[instanceKey] += damageReduction
				attack.reduceDamage(damageReduction)
			}
		}

		otherPlayer.hooks.afterAttack[instance] = (attackResult) => {
			const {player, row} = pos

			if (player.custom[instanceKey] > 0 && row) {
				discardCard(game, row.effectCard)
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
		delete otherPlayer.hooks.afterAttack[instance]
		delete otherPlayer.hooks.turnEnd[instance]
		delete player.custom[this.getInstanceKey(instance)]
	}
}

export default ShieldEffectCard
