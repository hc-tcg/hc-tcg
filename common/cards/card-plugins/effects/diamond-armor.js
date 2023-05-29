import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */
class DiamondArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'diamond_armor',
			name: 'Diamond Armor',
			rarity: 'rare',
			description:
				'Protects from the first +30hp damage.\n\nDiscard after user is knocked out.',
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
			attack.defence.damageReduction += 30
		}

		return attack
	}
}

export default DiamondArmorEffectCard
