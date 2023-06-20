import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'

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
		const {player} = pos

		player.hooks.onAttack[instance] = (attack) => {
			if (!['primary', 'secondary', 'zero'].includes(attack.type)) return

			if (player.board.activeRow === pos.rowIndex && attack.attacker) {
				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					target: attack.attacker,
					attacker: attack.target,
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
		delete pos.player.hooks.onAttack[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default ThornsIIEffectCard
