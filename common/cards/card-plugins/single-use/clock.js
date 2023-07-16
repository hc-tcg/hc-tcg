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
	 */
	onAttach(game, instance, pos) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			// Block all actions except for "CHANGE_ACTIVE_HERMIT" and all the wait and followup actions
			opponentPlayer.hooks.blockedActions.add(instance, (blockedActions) => {
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
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				opponentPlayer.hooks.blockedActions.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
			})
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		// The other player wouldn't be able to attach anything
		if (game.state.turn === 1) return 'NO'
		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default ClockSingleUseCard
