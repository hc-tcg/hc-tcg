import SingleUseCard from './_single-use-card'
import {validPick} from '../../../../server/utils/reqs'
import {getEmptyRow} from '../../../../server/utils/state-gen'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class EnderPearlSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ender_pearl',
			name: 'Ender Pearl',
			rarity: 'common',
			description:
				'Move your active Hermit and any attached cards to an open slot on your board.\n\nSubtract 10 health from this Hermit.\n\nDiscard after use.',
		})
		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: 'hermit', amount: 1, empty: true},
		])
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, actionState) => {
			const {singleUseInfo, currentPlayer} = game.ds
			const {pickedCardsInfo} = actionState

			if (singleUseInfo?.id === this.id) {
				if (pickedCardsInfo[this.id].length !== 1) return 'INVALID'

				const pickedSlot = pickedCardsInfo[this.id][0]
				if (!validPick(game.state, this.pickReqs[0], pickedSlot))
					return 'INVALID'
				if (pickedSlot.card !== null) return 'INVALID'
				if (currentPlayer.board.activeRow === null) return 'INVALID'

				const activeRow =
					currentPlayer.board.rows[currentPlayer.board.activeRow]
				if (activeRow.health) activeRow.health -= 10
				currentPlayer.board.rows[pickedSlot.rowIndex] = activeRow
				currentPlayer.board.rows[currentPlayer.board.activeRow] = getEmptyRow()
				currentPlayer.board.activeRow = pickedSlot.rowIndex
				return 'DONE'
			}
		})
	}
}

export default EnderPearlSingleUseCard
