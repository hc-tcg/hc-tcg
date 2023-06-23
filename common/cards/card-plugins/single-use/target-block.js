import {getNonEmptyRows} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
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
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const pickedSlot = pickedSlots[this.id]?.[0]
			if (!pickedSlot) return

			player.hooks.beforeAttack[instance] = (attack) => {
				if (['backlash', 'ailment'].includes(attack.type)) return
				if (!pickedSlot.row || !pickedSlot.row.state.hermitCard) return
				attack.target.rowIndex = pickedSlot.row.index
				attack.target.row = pickedSlot.row.state
				delete player.hooks.beforeAttack[instance]
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
		delete player.hooks.onApply[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default TargetBlockSingleUseCard
