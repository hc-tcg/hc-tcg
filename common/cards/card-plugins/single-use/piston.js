import SingleUseCard from './_single-use-card'
import {discardCard, discardSingleUse, getAdjacentRows, rowHasEmptyItemSlot, rowHasItem} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('common/types/pick-process').PickedSlotsInfo} PickedSlotsInfo
 * @typedef {import('server/models/game-model').GameModel} GameModel
 */

class PistonSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'piston',
			name: 'Piston',
			rarity: 'common',
			description:
				"Move 1 of your attached item cards to an adjacent active or AFK Hermit. You can use another single use effect card this turn.",
		})
		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: 'item', amount: 1},
			{target: 'player', type: 'item', amount: 1, empty: true, adjacent: 'req'},
		])
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {PickedSlotsInfo} pickedSlotsInfo
	 * @returns {"DONE" | "INVALID"}
	 */
	onApply(game, instance, pickedSlotsInfo) {
		const {singleUseInfo, currentPlayer} = game.ds
		if (singleUseInfo?.id !== this.id) return 'INVALID'

		const pickedSlots = pickedSlotsInfo[this.id] || []

        if (pickedSlots.length !== 2) return 'INVALID'

        const itemCardInfo = pickedSlots[0]
        const targetSlotInfo = pickedSlots[1]

		if (targetSlotInfo.card !== null) return 'INVALID' 

        // Remove item from source
		itemCardInfo.row.itemCards[itemCardInfo.slotIndex] = null

		// Add item to target
		targetSlotInfo.row.itemCards[targetSlotInfo.slotIndex] =
			itemCardInfo.card

        currentPlayer.custom[this.getInstanceKey(instance)] = true

		return 'DONE'
	}
	
    /**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {"YES" | "NO" | "INVALID"}
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'NO') return 'NO'
		const {currentPlayer} = game.ds

        const adjacents = getAdjacentRows(currentPlayer)
        let validPairs = 0
        for (const rows of adjacents) {
            if (rowHasEmptyItemSlot(rows[0]) && rowHasEmptyItemSlot(rows[1]) && (rowHasItem(rows[0]) || rowHasItem(rows[1]))) validPairs++
        }
        if (validPairs === 0) return 'NO'

		return 'YES'
	}

    /**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
        const {currentPlayer} = game.ds

        currentPlayer.hooks.availableActions[instance] = (availableActions) => {
            if (currentPlayer.custom[this.getInstanceKey(instance)]) {
                discardSingleUse(game, currentPlayer)
                currentPlayer.board.singleUseCardUsed = false
                availableActions.push('PLAY_SINGLE_USE_CARD')
            }
            return availableActions
        }
    }

    /**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds

		// Remove all hooks and flags
		delete currentPlayer.hooks.availableActions[instance]
        delete currentPlayer.custom[this.getInstanceKey(instance)]
	}
}

export default PistonSingleUseCard