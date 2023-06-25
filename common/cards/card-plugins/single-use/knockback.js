import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {
	applySingleUse,
	getActiveRow,
	getNonEmptyRows,
} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class KnockbackSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'knockback',
			name: 'Knockback',
			rarity: 'rare',
			description:
				'After attack, your opponent must choose an AFK Hermit to replace their active Hermit, unless they have no AFK Hermits. ',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {opponentPlayer} = pos

		// Check if there is an AFK Hermit
		const inactiveRows = getNonEmptyRows(opponentPlayer, false)
		if (inactiveRows.length === 0) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack[instance] = (attack, pickedSlots) => {
			applySingleUse(game, pickedSlots)

			// Only Apply this for the first attack
			delete player.hooks.afterAttack[instance]
		}

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const activeRow = getActiveRow(opponentPlayer)

			if (activeRow && activeRow.health) {
				activeRow.ailments.push({id: 'knockedout', duration: 1})
				opponentPlayer.board.activeRow = null
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.afterAttack[instance]
		delete player.hooks.onApply[instance]
	}
}

export default KnockbackSingleUseCard
