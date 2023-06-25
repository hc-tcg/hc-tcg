import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {isTargetingPos} from '../../../../server/utils/attacks'

class ThornsIIEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns_ii',
			name: 'Thorns II',
			rarity: 'rare',
			description: 'Opponent takes 20hp damage after their attack.',
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {opponentPlayer} = pos

		// Only when the opponent attacks us
		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (!['primary', 'secondary', 'zero'].includes(attack.type)) return

			if (attack.attacker && isTargetingPos(attack, pos)) {
				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					attacker: attack.target,
					target: attack.attacker,
					type: 'backlash',
				}).addDamage(20)

				attack.addNewAttack(backlashAttack)
			}

			return attack
		}
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		delete pos.opponentPlayer.hooks.onAttack[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default ThornsIIEffectCard
