import {AttackModel} from '../../../models/attack-model'
import EffectCard from './_effect-card'

class IronArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'iron_armor',
			name: 'Iron Armor',
			rarity: 'common',
			description:
				'Protects from the first +20hp damage taken.\n\nDiscard after user is knocked out.',
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
			attack.defence.damageReduction += 20
		}

		return attack
	}
}

export default IronArmorEffectCard
