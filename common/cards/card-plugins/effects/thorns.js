import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {isTargetingPos} from '../../../../server/utils/attacks'
import {getCardPos} from '../../../../server/utils/cards'

class ThornsEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns',
			name: 'Thorns',
			rarity: 'common',
			description:
				'When the hermit this card is attached to takes damage, your opponent takes 20hp damage.',
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
				}).addDamage(this.id, 20)

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
}

export default ThornsEffectCard
