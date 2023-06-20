import SingleUseCard from './_single-use-card'
import {isRemovable} from '../../../../server/utils'
import {swapSlots} from '../../../../server/utils/slots'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/cards').SlotPos} SlotPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class EmeraldSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'emerald',
			name: 'Emerald',
			rarity: 'rare',
			description:
				"Steal or swap the attached effect card of your opponent's active Hermit.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const {player, opponentPlayer} = pos
		const playerActiveRowIndex = player.board.activeRow
		const opponentActiveRowIndex = opponentPlayer.board.activeRow

		if (playerActiveRowIndex === null || opponentActiveRowIndex === null)
			return 'NO'

		const opponentActiveRow = opponentPlayer.board.rows[opponentActiveRowIndex]
		const playerActiveRow = player.board.rows[playerActiveRowIndex]

		const opponentEffect = opponentActiveRow.effectCard
		const playerEffect = playerActiveRow.effectCard

		if (!opponentEffect && !playerEffect) return 'NO'
		if (
			(opponentEffect && !isRemovable(opponentEffect)) ||
			(playerEffect && !isRemovable(playerEffect))
		)
			return 'NO'

		return 'YES'
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {player, opponentPlayer} = pos
		const playerActiveRowIndex = player.board.activeRow
		const opponentActiveRowIndex = opponentPlayer.board.activeRow

		if (playerActiveRowIndex === null || opponentActiveRowIndex === null) return

		const opponentActiveRow = opponentPlayer.board.rows[opponentActiveRowIndex]
		const playerActiveRow = player.board.rows[playerActiveRowIndex]

		/** @type {SlotPos} */ const playerSlot = {
			rowIndex: playerActiveRowIndex,
			row: playerActiveRow,
			slot: {
				index: 0,
				type: 'effect',
			},
		}
		/** @type {SlotPos} */ const opponentSlot = {
			rowIndex: opponentActiveRowIndex,
			row: opponentActiveRow,
			slot: {
				index: 0,
				type: 'effect',
			},
		}

		swapSlots(game, playerSlot, opponentSlot)
	}
}

export default EmeraldSingleUseCard
