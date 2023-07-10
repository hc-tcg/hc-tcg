import singleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'
import {swapSlots} from '../../../../server/utils/slots'
import {getNonEmptyRows, isRemovable, canAttachToCard} from '../../../../server/utils'

/**
 * @typedef {import('common/types/cards').SlotPos} SlotPos
 */

class MendingSingleUseCard extends singleUseCard {
	constructor() {
		super({
			id: 'mending',
			name: 'Mending',
			rarity: 'ultra_rare',
			description: 'Move any attached effect card from your active Hermit to an AFK Hermit.',
			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					slot: ['effect'],
					amount: 1,
					empty: true,
					active: false,
				},
			],
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply[instance] = (pickedSlots) => {
			const pickedCards = pickedSlots[this.id] || []

			if (pickedCards.length !== 1) return

			const targetSlotInfo = pickedCards[0]
			const {player} = pos
			if (player.board.activeRow === null || !targetSlotInfo.row) return
			const playerActiveRow = player.board.rows[player.board.activeRow]
			if (targetSlotInfo.row.state.effectCard !== null) return
			if (!playerActiveRow.effectCard) return

			const hermitCard = targetSlotInfo.row.state.hermitCard
			const effectCard = playerActiveRow.effectCard
			if (!canAttachToCard(game, hermitCard, effectCard)) return

			// swap slots
			/** @type {SlotPos} */ const sourcePos = {
				rowIndex: player.board.activeRow,
				row: playerActiveRow,
				slot: {
					index: 0,
					type: 'effect',
				},
			}

			/** @type {SlotPos} */ const targetPos = {
				rowIndex: targetSlotInfo.row.index,
				row: targetSlotInfo.row.state,
				slot: {
					index: targetSlotInfo.slot.index,
					type: 'effect',
				},
			}

			swapSlots(game, sourcePos, targetPos)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos

		if (player.board.activeRow === null) return 'NO'

		const effectCard = player.board.rows[player.board.activeRow].effectCard
		if (!effectCard || !isRemovable(effectCard)) return 'NO'

		// check if there is an empty slot available to move the effect card to
		const inactiveHermits = getNonEmptyRows(player, false)
		for (const hermit of inactiveHermits) {
			if (!hermit) continue
			const effect = hermit.row.effectCard
			if (!effect || isRemovable(effect)) return 'YES'
		}

		// check if the effect card can be attached to any of the inactive hermits
		for (const hermit of inactiveHermits) {
			if (canAttachToCard(game, hermit.row.hermitCard, effectCard)) return 'YES'
		}

		return 'NO'
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
}

export default MendingSingleUseCard
