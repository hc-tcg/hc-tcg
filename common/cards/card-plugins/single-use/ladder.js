import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('common/types/pick-process').PickedSlotsInfo} PickedSlotsInfo
 * @typedef {import('server/models/game-model').GameModel} GameModel
 */

class LadderSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ladder',
			name: 'Ladder',
			rarity: 'ultra_rare',
			description:
				"Before attacking swap your active Hermit card with one of your adjacent AFK Hermits.\n\nAll cards attached to both Hermits, including health, remain in place.\n\nActive and AFK status does not change.",
		})
		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: 'hermit', amount: 1, adjacent: 'active'},
		])
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {PickedSlotsInfo} pickedSlotsInfo
	 */
	onApply(game, instance, pickedSlotsInfo) {
		const {playerActiveRow} = game.ds
		const pickedSlots = pickedSlotsInfo[this.id] || []

        if (pickedSlots.length !== 1 || !playerActiveRow) return

        const activeHermitCard = playerActiveRow?.hermitCard
        const inactiveHermitCardInfo = pickedSlots[0]
        const inactiveHermitCard = inactiveHermitCardInfo.card

		if (inactiveHermitCard === null) return

        playerActiveRow.hermitCard = inactiveHermitCard
        inactiveHermitCardInfo.row.hermitCard = activeHermitCard
	}
	
    /**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'NO') return 'INVALID'
		const {currentPlayer} = game.ds

        const playerBoard = currentPlayer.board
        const activeRowIndex = playerBoard.activeRow
        if (activeRowIndex === null) return 'INVALID'

        const adjacentRowsIndex = [activeRowIndex - 1, activeRowIndex + 1].filter((index) => index >= 0)
        for (const rowIndex of adjacentRowsIndex) {
            const row = playerBoard.rows[rowIndex]
            if (row.hermitCard !== null) return 'YES'
        }
        
		return 'INVALID'
	}
}

export default LadderSingleUseCard