import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class EnderPearlSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ender_pearl',
			name: 'Ender Pearl',
			rarity: 'common',
			description:
				'Move your active Hermit and any attached cards to an open slot on your board.\n\nSubtract 10 health from this Hermit.',

			pickOn: 'apply',
			pickReqs: [
				{
					target: 'player',
					slot: ['hermit'],
					amount: 1,
					empty: true,
					emptyRow: true,
				},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos
		for (const row of player.board.rows) {
			if (row.hermitCard === null) return 'YES'
		}
		return 'NO'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []

			if (slots.length !== 1) return

			const pickedSlot = slots[0]
			if (player.board.activeRow === null || !pickedSlot.row) return

			const activeRow = player.board.rows[player.board.activeRow]
			if (activeRow.health) activeRow.health -= 10
			player.board.rows[pickedSlot.row.index] = activeRow
			player.board.rows[player.board.activeRow] = pickedSlot.row.state
			player.board.activeRow = pickedSlot.row.index
		}
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

export default EnderPearlSingleUseCard
