import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class NetheriteArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'netherite_armor',
			name: 'Netherite Armor',
			rarity: 'ultra_rare',
			description:
				'Protects from the first +40hp damage.\n\nDiscard after user is knocked out.',
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	onDefence(game, instance, attack) {
		if (attack.type !== 'ailment') {
			attack.defence.damageReduction += 40
		}

		return attack
	}
}

export default NetheriteArmorEffectCard
