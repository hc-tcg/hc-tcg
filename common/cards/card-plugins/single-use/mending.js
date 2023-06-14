import singleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {validPick} from '../../../../server/utils/reqs'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 *
 */

// TODO - Must work with Gemintay ability to use two single use cards per turn (should mend the first one)
class MendingSingleUseCard extends singleUseCard {
	constructor() {
		super({
			id: 'mending',
			name: 'Mending',
			rarity: 'ultra_rare',
			description:
				'Move any attached effect card from your active Hermit to an AFK Hermit.',
		})

		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: ['effect'], amount: 1, active: true},
			{
				target: 'player',
				type: ['effect'],
				amount: 1,
				empty: true,
				active: false,
			},
		])
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('server/utils/picked-cards').PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const pickedCards = pickedSlots[this.id] || []

		const effectCardInfo = pickedCards[0]
		const targetSlotInfo = pickedCards[1]
		if (!effectCardInfo.row || !targetSlotInfo.row) return false
		if (!validPick(game.state, this.pickReqs[0], effectCardInfo)) return false
		if (
			targetSlotInfo.row.state.effectCard !== null ||
			!effectCardInfo.row.state.effectCard
		)
			return false
		if (!validPick(game.state, this.pickReqs[1], targetSlotInfo)) return false

		// add effect to target
		targetSlotInfo.row.state.effectCard = effectCardInfo.row?.state.effectCard

		// remove effect from source
		effectCardInfo.row.state.effectCard = null
	}
}

export default MendingSingleUseCard
