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
	 */
	onApply(game, instance, pickedSlotsInfo) {
		const {singleUseInfo, currentPlayer} = game.ds
		if (singleUseInfo?.id !== this.id) return

		const pickedSlots = pickedSlotsInfo[this.id] || []
        if (pickedSlots.length !== 1) return

        const slot = pickedSlots[0]
		if (slot.card !== null) return

        discardCard(game, slot.card)

        currentPlayer.custom[this.getInstanceKey(instance)] = true

		discardSingleUse(game, currentPlayer)
	}
	
    /**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {"YES" | "NO" | "INVALID"}
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'NO') return 'INVALID'
		const {currentPlayer} = game.ds

        for (const row of currentPlayer.board.rows) {
           if (row.effectCard !== null || rowHasItem(row)) return 'YES'
        }

		return 'INVALID'
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

export default FireChargeSingleUseCard