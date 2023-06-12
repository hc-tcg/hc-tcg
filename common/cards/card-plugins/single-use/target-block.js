import {getHasRedirectingCards, getNonEmptyRows} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
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
			pickReqs: /** @satisfies {Array<PickRequirmentT>} */ ([
				{target: 'opponent', type: ['hermit'], amount: 1, active: false},
			]),
		})
	}

	getIsRedirecting() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {player} = pos
		const pickedSlot = pickedSlots[this.id][0]

		player.hooks.beforeAttack[instance] = (attack) => {
			if (!pickedSlot.row || !pickedSlot.row.state.hermitCard) return
			attack.target.index = pickedSlot.row.index
			attack.target.row = pickedSlot.row.state
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {otherPlayer} = pos

		// Inactive Hermits
		if (getNonEmptyRows(otherPlayer, false).length === 0) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.beforeAttack[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default TargetBlockSingleUseCard
