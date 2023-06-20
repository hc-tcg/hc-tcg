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
		const {player} = pos

		player.hooks.onAttack[instance] = (attack, pickedSlots) => {
			applySingleUse(game, pickedSlots)
			delete player.hooks.onAttack[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onAttack[instance]
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {opponentPlayer} = pos
		const activeRow = getActiveRow(opponentPlayer)

		if (activeRow && activeRow.health) {
			activeRow.ailments.push({id: 'knockedout', duration: 1})
			opponentPlayer.board.activeRow = null
		}
	}
}

export default KnockbackSingleUseCard
