import SingleUseCard from './_single-use-card'
import {isRemovable} from '../../../../server/utils'
import {swapSlots} from '../../../../server/utils/slots'
import {GameModel} from '../../../../server/models/game-model'
import {canAttachToCard} from '../../../../server/utils'

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
			description: "Steal or swap the attached effect card of your opponent's active Hermit.",
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

		if (playerActiveRowIndex === null || opponentActiveRowIndex === null) return 'NO'

		const opponentActiveRow = opponentPlayer.board.rows[opponentActiveRowIndex]
		const playerActiveRow = player.board.rows[playerActiveRowIndex]

		if (!opponentActiveRow.effectCard || !playerActiveRow.effectCard) {
			return 'NO'
		}

		const opponentEffect = opponentActiveRow.effectCard
		const playerEffect = playerActiveRow.effectCard
		const opponentHermit = opponentActiveRow.hermitCard
		const playerHermit = playerActiveRow.hermitCard

		if (!canAttachToCard(game, opponentEffect, playerHermit)) return 'NO'
		if (!canAttachToCard(game, playerEffect, opponentHermit)) return 'NO'

		if (opponentEffect && !isRemovable(opponentEffect)) return 'NO'
		if (playerEffect && !isRemovable(playerEffect)) return 'NO'

		return 'YES'
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const playerActiveRowIndex = player.board.activeRow
		const opponentActiveRowIndex = opponentPlayer.board.activeRow

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}
}

export default EmeraldSingleUseCard
