import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'

class ThornsEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns',
			name: 'Thorns',
			rarity: 'common',
			description: 'Opponent takes 10hp damage after their attack.',
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (!['primary', 'secondary', 'zero'].includes(attack.type)) return

			if (attack.attacker && player.board.activeRow === pos.rowIndex) {
				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					target: attack.attacker,
					type: 'backlash',
				}).addDamage(10)

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
