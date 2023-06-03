import {discardCard, discardSingleUse, rowHasItem} from '../../../../server/utils'
import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('common/types/pick-process').PickedSlotsInfo} PickedSlotsInfo
 * @typedef {import('server/models/game-model').GameModel} GameModel
 */

class FireChargeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fire_charge',
			name: 'Fire Charge',
			rarity: 'common',
			description:
				"Discard 1 attached item or effect card from your active or AFK Hermit.\n\nYou can use another single use effect card this turn.",
		})
		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: ['item', 'effect'], amount: 1},
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
        if (pickedSlots.length !== 1) return 'INVALID'

        const slot = pickedSlots[0]
		if (slot.card !== null) return 'INVALID' 

        discardCard(game, slot.card)

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

        for (const row of currentPlayer.board.rows) {
           if (row.effectCard !== null || rowHasItem(row)) return 'YES'
        }

		return 'NO'
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

export default FireChargeSingleUseCard