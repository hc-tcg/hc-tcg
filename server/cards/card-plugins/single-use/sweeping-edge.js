import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class SweepingEdgeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'sweeping_edge',
			name: 'Sweeping Edge',
			rarity: 'ultra_rare',
			description:
				'Opponent must discard any effect cards attached to their active Hermit and adjacent Hermits.\n\nDiscard after use.',
		})

		this.useReqs = [
			{target: 'opponent', type: 'effect', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, opponentPlayer} = game.ds

			if (singleUseInfo?.id === this.id) {
				const activeRow = opponentPlayer.board.activeRow
				if (activeRow === null) return 'INVALID'

				const rows = opponentPlayer.board.rows
				const targetRows = [
					rows[activeRow - 1],
					rows[activeRow],
					rows[activeRow + 1],
				].filter(Boolean)

				targetRows.forEach((row) => {
					if (row.effectCard) discardCard(game, row.effectCard)
				})

				return 'DONE'
			}
		})
	}
}

export default SweepingEdgeSingleUseCard
