import SingleUseCard from './_single-use-card'
import {isRemovable} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class EmeraldSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'emerald',
			name: 'Emerald',
			rarity: 'rare',
			description:
				"Steal or swap the attached effect card of your opponent's active Hermit.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'

		const {player, otherPlayer} = pos
		const playerActiveRowIndex = player.board.activeRow
		const opponentActiveRowIndex = otherPlayer.board.activeRow

		if (playerActiveRowIndex === null || opponentActiveRowIndex === null)
			return 'NO'

		const opponentActiveRow = otherPlayer.board.rows[opponentActiveRowIndex]
		const playerActiveRow = player.board.rows[playerActiveRowIndex]

		const opponentEffect = opponentActiveRow.effectCard
		const playerEffect = playerActiveRow.effectCard

		if (!opponentEffect && !playerEffect) return 'NO'
		if (
			(opponentEffect && !isRemovable(opponentEffect)) ||
			(playerEffect && !isRemovable(playerEffect))
		)
			return 'NO'

		return 'YES'
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
		const {player, otherPlayer} = pos
		const playerActiveRowIndex = player.board.activeRow
		const opponentActiveRowIndex = otherPlayer.board.activeRow

		if (playerActiveRowIndex === null || opponentActiveRowIndex === null) return

		const opponentActiveRow = otherPlayer.board.rows[opponentActiveRowIndex]
		const playerActiveRow = player.board.rows[playerActiveRowIndex]

		const playerEffect = playerActiveRow.effectCard
		const opponentEffect = opponentActiveRow.effectCard

		playerActiveRow.effectCard = opponentEffect
		opponentActiveRow.effectCard = playerEffect
	}
}

export default EmeraldSingleUseCard
