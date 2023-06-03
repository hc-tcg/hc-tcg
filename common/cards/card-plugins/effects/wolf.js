import { AttackModel } from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'

class WolfEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wolf',
			name: 'Wolf',
			rarity: 'rare',
			description:
				'Opponent takes 20hp damage after their attack.\nIgnores armour.',
		})
		this.protection = {backlash: 20}
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	onDefence(game, instance, attack) {
		if (attack.attacker) {
			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: attack.target,
				target: attack.attacker,
				type: 'backlash',
			})
			backlashAttack.addDamage(20)
			backlashAttack.ignoreAttachedEffects = true

			return backlashAttack
		}
	}
}

export default WolfEffectCard
