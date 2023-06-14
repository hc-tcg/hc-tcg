import singleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {validPick} from '../../../../server/utils/reqs'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 *
 */

class MendingSingleUseCard extends singleUseCard {
	constructor() {
		super({
			id: 'mending',
			name: 'Mending',
			rarity: 'ultra_rare',
			description:
				'Move any attached effect card from your active Hermit to an AFK Hermit.',
			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					type: ['effect'],
					amount: 1,
					empty: true,
				},
			],
		})
	}

	canApply() {
		return true
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

		if (pickedCards.length !== 1) return

		const targetSlotInfo = pickedCards[0]
		const {player} = pos
		if (!player.board.activeRow || !targetSlotInfo.row) return
		const playerActiveRow = player.board.rows[player.board.activeRow]
		if (
			targetSlotInfo.row.state.effectCard !== null ||
			!playerActiveRow.effectCard
		)
			return
		if (!validPick(game.state, this.pickReqs[0], targetSlotInfo)) return

		// add effect to target
		targetSlotInfo.row.state.effectCard = playerActiveRow.effectCard

		// remove effect from source
		playerActiveRow.effectCard = null
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos
		if (!player.board.activeRow) return 'NO'
		if (!player.board.rows[player.board.activeRow].effectCard) return 'NO'
		return 'YES'
	}
}

export default MendingSingleUseCard
