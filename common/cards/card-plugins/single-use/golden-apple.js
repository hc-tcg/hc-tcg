import SingleUseCard from './_single-use-card'
import {validPick} from '../../../../server/utils/reqs'
import {GameModel} from '../../../../server/models/game-model'
import HERMIT_CARDS from '../hermits'
import { getNonEmptyRows } from 'server/utils'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class GoldenAppleSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_apple',
			name: 'Golden Apple',
			rarity: 'ultra_rare',
			description: 'Heal AFK Hermit 100hp.',
			pickOn: 'apply',
			pickReqs: [
				{target: 'player', type: ['hermit'], amount: 1, active: false},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('../../../../server/utils/picked-cards').PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const pickedCards = pickedSlots[this.id] || []
		if (pickedCards.length !== 1) return

		const targetSlot = pickedCards[0]
		if (!targetSlot.row?.state.health) return
		const rowState = targetSlot.row.state
		rowState.health = Math.min(
			rowState.health + 100,
			HERMIT_CARDS[rowState.hermitCard.cardId].health
		)
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const inactiveRows = getNonEmptyRows(pos.player, false)
		if (inactiveRows.length === 0) return 'NO'

		return 'YES'
	}
}

export default GoldenAppleSingleUseCard
