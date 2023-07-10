import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'
import {isTargetingPos} from '../../../../server/utils/attacks'
import EffectCard from './_effect-card'

class NetheriteArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'netherite_armor',
			name: 'Netherite Armor',
			rarity: 'ultra_rare',
			description: 'Prevent up to 40hp damage each turn.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onDefence[instance] = (attack, pickedSlots) => {
			if (!isTargetingPos(attack, pos) || attack.isType('ailment')) return

			if (player.custom[instanceKey] === undefined) {
				player.custom[instanceKey] = 0
			}

			const totalReduction = player.custom[instanceKey]

			if (totalReduction < 40) {
				const damageReduction = Math.min(attack.getDamage(), 40 - totalReduction)
				player.custom[instanceKey] += damageReduction
				attack.reduceDamage(this.id, damageReduction)
			}
		}

		const resetCounter = () => {
			if (player.custom[instanceKey] !== undefined) {
				delete player.custom[instanceKey]
			}
		}

		// Reset counter at the start of every turn
		player.hooks.onTurnStart[instance] = resetCounter
		opponentPlayer.hooks.onTurnStart[instance] = resetCounter
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		delete player.hooks.onDefence[instance]
		delete player.hooks.onTurnStart[instance]
		delete opponentPlayer.hooks.onTurnStart[instance]
		delete player.custom[this.getInstanceKey(instance)]
	}
}

export default NetheriteArmorEffectCard
