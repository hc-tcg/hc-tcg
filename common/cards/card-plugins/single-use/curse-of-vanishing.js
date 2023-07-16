import SingleUseCard from './_single-use-card'
import {discardCard, isActive, isRemovable} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class CurseOfVanishingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_vanishing',
			name: 'Curse Of Vanishing',
			rarity: 'common',
			description: "Your opponent is forced to discard their active Hermit's attached effect card.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			if (opponentPlayer.board.activeRow === null) return
			const opponentActiveRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
			if (opponentActiveRow.effectCard && isRemovable(opponentActiveRow.effectCard)) {
				discardCard(game, opponentActiveRow.effectCard)
			}
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {opponentPlayer} = pos

		if (opponentPlayer.board.activeRow === null) return 'NO'
		const opponentActiveRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
		if (!opponentActiveRow.effectCard || !isRemovable(opponentActiveRow.effectCard)) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default CurseOfVanishingSingleUseCard
