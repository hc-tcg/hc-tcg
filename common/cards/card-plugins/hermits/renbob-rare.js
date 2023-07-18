import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {createWeaknessAttack} from '../../../../server/utils/attacks'

class RenbobRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'renbob_rare',
			name: 'Renbob',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 300,
			primary: {
				name: 'Loose Change',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Hyperspace',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power:
					'Damage is dealt to opponent directly opposite this card on the game board, regardless if AFK or active.',
			},
		})
	}

	/**
	 * Creates and returns attack objects
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('../../../types/attack').HermitAttackType} hermitAttackType
	 * @param {import('../../../types/pick-process').PickedSlots} pickedSlots
	 * @returns {Array<AttackModel>}
	 */
	getAttacks(game, instance, pos, hermitAttackType, pickedSlots) {
		const {opponentPlayer} = pos
		let attack = super.getAttacks(game, instance, pos, hermitAttackType, pickedSlots)[0]
		if (attack.type === 'secondary' && pos.rowIndex !== null) {
			const opponentPlayerRow = opponentPlayer.board.rows[pos.rowIndex]
			if (opponentPlayerRow.hermitCard) {
				attack.target = {
					player: opponentPlayer,
					rowIndex: pos.rowIndex,
					row: opponentPlayerRow,
				}
			} else {
				attack.target = null
			}
		}

		const attacks = [attack]

		if (attack.isType('primary', 'secondary')) {
			const weaknessAttack = createWeaknessAttack(attack)
			if (weaknessAttack) attacks.push(weaknessAttack)
		}

		return attacks
	}

	getExpansion() {
		return 'alter_egos'
	}

	getPalette() {
		return 'alter_egos'
	}

	getBackground() {
		return 'alter_egos_background'
	}
}

export default RenbobRareHermitCard
