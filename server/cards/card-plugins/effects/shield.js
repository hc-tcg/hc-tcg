import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'
import {AttackModel} from '../../../models/attack-model'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class ShieldEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'shield',
			name: 'Shield',
			rarity: 'common',
			description:
				'Protects from the first +10hp damage taken.\n\nDiscard following any damage taken.',
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
			attack.defence.damageReduction += 10
		}

		return attack
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('models/attack-model').AttackResult} attackResult
	 */
	afterDefence(game, instance, attackResult) {
		if (attackResult.blockedDamage > 0) {
			discardCard(game, {cardId: this.id, cardInstance: instance})
		}
	}
}

export default ShieldEffectCard
