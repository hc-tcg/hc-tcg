import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {isTargetingPos} from '../../../../server/utils/attacks'

class ThornsIIIEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns_iii',
			name: 'Thorns III',
			rarity: 'ultra_rare',
			description: 'Opponent takes 30hp damage after their attack.',
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
			if (!attack.isType('primary', 'secondary', 'zero') || attack.isBacklash) return

			if (attack.attacker && isTargetingPos(attack, pos)) {
				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					attacker: attack.target,
					target: attack.attacker,
					type: 'effect',
					isBacklash: true,
				}).addDamage(this.id, 30)

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

export default ThornsIIIEffectCard
