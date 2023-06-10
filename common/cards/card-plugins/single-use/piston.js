import SingleUseCard from './_single-use-card'
import {
	discardSingleUse,
	getAdjacentRows,
	rowHasEmptyItemSlot,
	rowHasItem,
} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class PistonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'piston',
			name: 'Piston',
			rarity: 'common',
			description:
				'Move 1 of your attached item cards to an adjacent active or AFK Hermit. You can use another single use effect card this turn.',
			pickOn: 'apply',
			pickReqs: /** @satisfies {Array<PickRequirmentT>} */ ([
				{target: 'player', type: ['item'], amount: 1},
				{
					target: 'player',
					type: ['item'],
					amount: 1,
					empty: true,
					adjacent: 'req',
				},
			]),
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {player} = pos
		const slots = pickedSlots[this.id] || []

		if (slots.length !== 2) return

		const itemCardInfo = slots[0]
		const targetSlotInfo = slots[1]

		if (
			targetSlotInfo.slot.card !== null ||
			!itemCardInfo.row ||
			!targetSlotInfo.row
		)
			return

		itemCardInfo.row.state.itemCards[itemCardInfo.slot.index] =
			targetSlotInfo.slot.card
		targetSlotInfo.row.state.itemCards[targetSlotInfo.slot.index] =
			itemCardInfo.slot.card

		player.custom[this.getInstanceKey(instance)] = true

		discardSingleUse(game, player)
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const adjacents = getAdjacentRows(pos.player)
		let validPairs = 0
		for (const rows of adjacents) {
			if (
				rowHasEmptyItemSlot(rows[0]) &&
				rowHasEmptyItemSlot(rows[1]) &&
				(rowHasItem(rows[0]) || rowHasItem(rows[1]))
			)
				validPairs++
		}
		if (validPairs === 0) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.availableActions[instance] = (availableActions) => {
			// We have to check if PLAY_SINGLE_USE_CARD is already there because it's possible that another card added it
			// e.g. if you play a card that allows you to play another single use card like multiple Pistons back to back
			if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) {
				availableActions.push('PLAY_SINGLE_USE_CARD')
			}
			return availableActions
		}

		player.hooks.onApply[instance] = (instance) => {
			if (
				player.custom[this.getInstanceKey(instance)] &&
				player.board.singleUseCardUsed
			) {
				delete player.hooks.availableActions[instance]
				delete player.custom[this.getInstanceKey(instance)]
			}
		}

		// We remove on turnEnd instead of onDetach because we need to keep the hooks
		// until the end of the turn in case the player plays another single use card
		player.hooks.turnEnd[instance] = () => {
			delete player.hooks.turnEnd[instance]
			delete player.hooks.availableActions[instance]
			delete player.custom[this.getInstanceKey(instance)]
		}
	}
}

export default PistonSingleUseCard
