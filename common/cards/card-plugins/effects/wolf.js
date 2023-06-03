import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'

class WolfEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wolf',
			name: 'Wolf',
			rarity: 'rare',
			description:
				'Opponent takes +20hp damage every time user is attacked until user is knocked out.\n\nDiscard after user is knocked out.',
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
			var backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				attacker: {index: attack.target.index, row: attack.target.row},
				target: {index: attack.attacker.index, row: attack.attacker.row},
				type: 'effect',
			})
			backlashAttack.addDamage(20)
			attack.addNewAttack(backlashAttack)
		}

		return attack
	}
}

export default WolfEffectCard
