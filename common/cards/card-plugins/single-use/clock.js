import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/game-state').AvailableActionsT} AvailableActionsT'
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class ClockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'clock',
			name: 'Clock',
			rarity: 'ultra_rare',
			description:
				'Your opponent skips their next turn.\n\nThey still draw a card and they may choose to make their active Hermit go AFK.',
		})
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
		const {otherPlayer} = pos

		// Block all player actions except for "CHANGE_ACTIVE_HERMIT"
		otherPlayer.hooks.blockedActions[instance] = (blockedActions) => {
			/** @type {AvailableActionsT}*/
			const blocked = [
				'APPLY_EFFECT',
				'REMOVE_EFFECT',
				'ZERO_ATTACK',
				'PRIMARY_ATTACK',
				'SECONDARY_ATTACK',
				'ADD_HERMIT',
				'PLAY_ITEM_CARD',
				'PLAY_SINGLE_USE_CARD',
				'PLAY_EFFECT_CARD',
			]

			blockedActions.push(...blocked)
			return blockedActions
		}

		otherPlayer.hooks.turnEnd[instance] = () => {
			delete otherPlayer.hooks.blockedActions[instance]
			delete otherPlayer.hooks.turnEnd[instance]
		}
	}
}

export default ClockSingleUseCard
