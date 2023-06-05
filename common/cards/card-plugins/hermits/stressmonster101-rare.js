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
				power: 'You and opponent take damage equal to your health.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds

		currentPlayer.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return
			if (!attack.attacker) return

			const backlashAttack = new AttackModel({
				id: attackId,
				attacker: {index: attack.target.index, row: attack.target.row},
				target: {index: attack.attacker.index, row: attack.attacker.row},
				type: 'backlash',
			})
			attack.addNewAttack(backlashAttack)

			const attackDamage = attack.attacker.row.health
			attack.addDamage(attackDamage)
			backlashAttack.addDamage(attackDamage)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		// Remove hooks
		delete currentPlayer.hooks.onAttack[instance]
	}
}

export default StressMonster101RareHermitCard
