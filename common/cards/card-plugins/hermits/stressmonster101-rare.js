import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'

class StressMonster101RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'stressmonster101_rare',
			name: 'Stress',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 300,
			primary: {
				name: 'Plonker',
				cost: ['prankster'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Yolo',
				cost: ['prankster', 'prankster', 'prankster'],
				damage: 0,
				power: 'You and your opponent take damage equal to your health.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('common/types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return
			if (!attack.attacker) return

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'selfAttack'),
				attacker: attack.target,
				target: attack.attacker,
				type: 'effect',
				isBacklash: true,
			})
			const attackDamage = attack.attacker.row.health
			attack.addDamage(this.id, attackDamage)
			backlashAttack.addDamage(this.id, attackDamage)

			attack.addNewAttack(backlashAttack)
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('common/types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default StressMonster101RareHermitCard
