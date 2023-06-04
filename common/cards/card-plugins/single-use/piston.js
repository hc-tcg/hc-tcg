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
	 */
	onApply(game, instance, pickedSlotsInfo) {
		const {singleUseInfo, currentPlayer} = game.ds
		if (singleUseInfo?.id !== this.id) return

		const pickedSlots = pickedSlotsInfo[this.id] || []

        if (pickedSlots.length !== 2) return

        const itemCardInfo = pickedSlots[0]
        const targetSlotInfo = pickedSlots[1]

		if (targetSlotInfo.card !== null) return

        // Remove item from source
		itemCardInfo.row.itemCards[itemCardInfo.slotIndex] = null

		// Add item to target
		targetSlotInfo.row.itemCards[targetSlotInfo.slotIndex] =
			itemCardInfo.card

        currentPlayer.custom[this.getInstanceKey(instance)] = true

		discardSingleUse(game, currentPlayer)
	}
	
    /**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'NO') return 'INVALID'
		const {currentPlayer} = game.ds

        const adjacents = getAdjacentRows(currentPlayer)
        let validPairs = 0
        for (const rows of adjacents) {
            if (rowHasEmptyItemSlot(rows[0]) && rowHasEmptyItemSlot(rows[1]) && (rowHasItem(rows[0]) || rowHasItem(rows[1]))) validPairs++
        }
        if (validPairs === 0) return 'INVALID'

		return 'YES'
	}

    /**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
        const {currentPlayer} = game.ds

        currentPlayer.hooks.availableActions[instance] = (availableActions) => {
			const singleUseCardUsed = currentPlayer.board.singleUseCardUsed
			// Allow to play another single use card until another card single use card is used
			// We have to do this because getAvailibleActions checks pastTurnActions and won't add it if it's already there
			// We also have to check if PLAY_SINGLE_USE_CARD is already there because it's possible that another card added it
			// e.g. if you play a card that allows you to play another single use card like multiple Pistons back to back
            if (currentPlayer.custom[this.getInstanceKey(instance)] && !singleUseCardUsed && !availableActions.includes('PLAY_SINGLE_USE_CARD')) {
    			availableActions.push('PLAY_SINGLE_USE_CARD')
            } else if (currentPlayer.custom[this.getInstanceKey(instance)] && singleUseCardUsed) {
				delete currentPlayer.hooks.availableActions[instance]
				delete currentPlayer.custom[this.getInstanceKey(instance)]
			}
            return availableActions
        }

		// We remove on turnEnd instead of onDetach because we need to keep the hooks
		// until the end of the turn in case the player plays another single use card
		currentPlayer.hooks.turnEnd[instance] = () => {
			delete currentPlayer.hooks.turnEnd[instance]
			delete currentPlayer.hooks.availableActions[instance]
			delete currentPlayer.custom[this.getInstanceKey(instance)]
		}
    }
}

export default PistonSingleUseCard