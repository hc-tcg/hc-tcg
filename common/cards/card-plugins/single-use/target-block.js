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
			pickReqs: [{target: 'opponent', type: ['hermit'], amount: 1, active: false}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos
		const ignoreThisWeakness = this.getInstanceKey(instance, 'ignoreThisWeakness')

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const pickedSlot = pickedSlots[this.id]?.[0]
			if (!pickedSlot) return

			player.hooks.beforeAttack[instance] = (attack) => {
				if (['backlash', 'ailment'].includes(attack.type)) return
				if (!pickedSlot.row || !pickedSlot.row.state.hermitCard) return

				attack.target.rowIndex = pickedSlot.row.index
				attack.target.row = pickedSlot.row.state

				if (['primary', 'secondary'].includes(attack.type)) {
					const weaknessAttack = createWeaknessAttack(attack)
					if (weaknessAttack) {
						attack.addNewAttack(weaknessAttack)
						player.custom[ignoreThisWeakness] = true
					}
				} else if (attack.type === 'weakness') {
					if (!player.custom[ignoreThisWeakness]) {
						attack.multiplyDamage(0).lockDamage()
					}
					delete player.custom[ignoreThisWeakness]
				}
			}
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
		const ignoreThisWeakness = this.getInstanceKey(instance, 'ignoreThisWeakness')
		delete player.hooks.onApply[instance]
		delete player.hooks.beforeAttack[instance]
		delete player.custom[ignoreThisWeakness]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default TargetBlockSingleUseCard
