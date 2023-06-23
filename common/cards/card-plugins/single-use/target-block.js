import {getNonEmptyRows} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {createWeaknessAttack} from '../../../../server/utils/attacks'
import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class TargetBlockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'target_block',
			name: 'Target Block',
			rarity: 'rare',
			description:
				"Choose one of your opponent's AFK Hermits to take all damage done during this turn.",
			pickOn: 'apply',
			pickReqs: [
				{target: 'opponent', type: ['hermit'], amount: 1, active: false},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {player} = pos
		const setWeakness = this.getInstanceKey(instance, 'setWeakness')
		const pickedSlot = pickedSlots[this.id]?.[0]
		if (!pickedSlot) return

		player.hooks.beforeAttack[instance] = (attack) => {
			if (attack.type === 'weakness' && !player.custom[setWeakness]) {
				attack.multiplyDamage(0).lockDamage
			}
			delete player.custom[setWeakness]

			if (['backlash', 'ailment', 'weakness'].includes(attack.type)) return
			if (!pickedSlot.row || !pickedSlot.row.state.hermitCard) return
			attack.target.rowIndex = pickedSlot.row.index
			attack.target.row = pickedSlot.row.state

			const weaknessAttack = createWeaknessAttack(attack)
			if (weaknessAttack) attack.addNewAttack(weaknessAttack)
			player.custom[setWeakness] = true
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {opponentPlayer} = pos

		// Inactive Hermits
		if (getNonEmptyRows(opponentPlayer, false).length === 0) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		const setWeakness = this.getInstanceKey(instance, 'setWeakness')

		delete player.hooks.beforeAttack[instance]
		delete player.custom[setWeakness]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default TargetBlockSingleUseCard
