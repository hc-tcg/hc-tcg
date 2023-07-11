import SingleUseCard from './_single-use-card'
import {
	discardSingleUse,
	getAdjacentRows,
	rowHasEmptyItemSlot,
	rowHasItem,
	canAttachToCard,
} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {swapSlots} from '../../../../server/utils/slots'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/cards').SlotPos} SlotPos
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
			pickReqs: [
				{target: 'player', slot: ['item'], type: ['item'], amount: 1},
				{
					target: 'player',
					slot: ['item'],
					amount: 1,
					empty: true,
					adjacent: 'req',
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

		const adjacents = getAdjacentRows(pos.player)
		let validPairs = 0
		for (const rows of adjacents) {
			let valid = false
			if (rowHasItem(rows[0]) && rowHasEmptyItemSlot(rows[1])) {
				for (const item of rows[0].itemCards) {
					if (canAttachToCard(game, rows[1].hermitCard, item)) {
						valid = true
						break
					}
				}
			}
			if (rowHasItem(rows[1]) && rowHasEmptyItemSlot(rows[0]) && !valid) {
				for (const item of rows[1].itemCards) {
					if (canAttachToCard(game, rows[0].hermitCard, item)) {
						valid = true
						break
					}
				}
			}

			if (valid) validPairs++
		}
		if (validPairs) return 'YES'

		return 'NO'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos
		player.hooks.beforeApply[instance] = (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []

			if (slots.length !== 2) return

			const itemCardInfo = slots[0]
			const targetSlotInfo = slots[1]

			if (targetSlotInfo.slot.card !== null || !itemCardInfo.row || !targetSlotInfo.row) return

			const hermitCard = targetSlotInfo.row.state.hermitCard
			const itemCard = itemCardInfo.slot.card
			if (!canAttachToCard(game, hermitCard, itemCard)) return

			/** @type {SlotPos} */ const itemPos = {
				rowIndex: itemCardInfo.row.index,
				row: itemCardInfo.row.state,
				slot: {
					index: itemCardInfo.slot.index,
					type: 'item',
				},
			}

			/** @type {SlotPos} */ const targetPos = {
				rowIndex: targetSlotInfo.row.index,
				row: targetSlotInfo.row.state,
				slot: {
					index: targetSlotInfo.slot.index,
					type: 'item',
				},
			}

			swapSlots(game, itemPos, targetPos)

			// We remove on turnEnd instead of onDetach because we need to keep the hooks
			// until the end of the turn in case the player plays another single use card
			player.hooks.onTurnEnd[instance] = () => {
				delete player.hooks.onTurnEnd[instance]
				delete player.hooks.availableActions[instance]
				delete player.hooks.onApply[instance]
			}

			player.hooks.availableActions[instance] = (availableActions) => {
				// We have to check if PLAY_SINGLE_USE_CARD is already there because it's possible that another card added it
				// e.g. if you play a card that allows you to play another single use card like multiple Pistons back to back
				if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) {
					availableActions.push('PLAY_SINGLE_USE_CARD')
				}

				return availableActions
			}

			player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
				if (player.board.singleUseCard?.cardInstance === instance) return
				delete player.hooks.availableActions[instance]
				delete player.hooks.onTurnEnd[instance]
				delete player.hooks.onApply[instance]
			}
		}

		player.hooks.afterApply[instance] = (pickedSlots, modalResult) => {
			discardSingleUse(game, player)
		}
	}

	onDetach(game, instance, pos) {
		const {player} = pos

		delete player.hooks.afterApply[instance]
		delete player.hooks.beforeApply[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default PistonSingleUseCard
