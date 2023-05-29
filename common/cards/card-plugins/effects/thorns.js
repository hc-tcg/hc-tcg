import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class ThornsEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns',
			name: 'Thorns',
			rarity: 'common',
			description:
				'Opposing Hermit takes +10hp damage after attack.\n\nDiscard after user is knocked out.',
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	onDefence(game, instance, attack) {
		// only add backlash if there's a hermit behind the attack
		if (attack.attacker) {
			attack.defence.backlash += 10
		}

		return attack
	}
}

export default ThornsEffectCard
