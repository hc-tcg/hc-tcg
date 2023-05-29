import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class CurseOfVanishingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_vanishing',
			name: 'Curse Of Vanishing',
			rarity: 'common',
			description:
				"Opponent is forced to discard their active Hermit's attached effect card.\n\nDiscard after use.",
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
				const activeRowState = opponentPlayer.board.rows[activeRow]
				if (!activeRowState) return 'INVALID'
				if (activeRowState.effectCard) {
					discardCard(game, activeRowState.effectCard)
				}
				return 'DONE'
			}
		})
	}
}

export default CurseOfVanishingSingleUseCard
