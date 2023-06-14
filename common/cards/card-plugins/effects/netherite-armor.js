import {GameModel} from '../../../../server/models/game-model'
import EffectCard from './_effect-card'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class NetheriteArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'netherite_armor',
			name: 'Netherite Armor',
			rarity: 'ultra_rare',
			description:
				'Prevent up to 20hp damage taken.\n\nAlso prevents additional damage to this Hermit from all effect cards.\n\nOpponent can not make this Hermit go AFK.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {otherPlayer, player, row} = pos
		const instanceKey = this.getInstanceKey(instance)
		const activeRowIndex = pos.player.board.activeRow

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

		otherPlayer.hooks.onApply[instance] = (instance) => {
			// Prevent being knocked out
			if (activeRowIndex === pos.rowIndex && row) {
				player.board.activeRow = pos.rowIndex
				row.ailments = row.ailments.filter((a) => a.id !== 'knockedout')
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
		delete otherPlayer.hooks.turnEnd[instance]
		delete otherPlayer.hooks.onApply[instance]
		delete player.custom[this.getInstanceKey(instance)]
	}
}

export default NetheriteArmorEffectCard
