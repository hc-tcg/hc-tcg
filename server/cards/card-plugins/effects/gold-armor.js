import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'
import {AttackModel} from 'models/attack-model'

class GoldArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'gold_armor',
			name: 'Gold Armor',
			rarity: 'common',
			description:
				'Protects from the first +30hp damage taken.\n\nDiscard following any damage taken.',
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

export default GoldArmorEffectCard
