import SingleUseCard from './_single-use-card'
import {applySingleUse, hasSingleUse} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class ChorusFruitSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chorus_fruit',
			name: 'Chorus Fruit',
			rarity: 'common',
			description:
				"Swap active Hermit with AFK Hermit at the end of the player's turn.\n\nDiscard after use.",
		})

		this.useReqs = [
			{target: 'player', type: 'hermit', amount: 1, active: false},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// Set flag when chorus fruit is applied
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, currentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				currentPlayer.custom[this.id] = true
				return 'DONE'
			}
		})

		// Remove flag when active hermit is changed
		game.hooks.changeActiveHermit.tap(this.id, () => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})

		// Remove flag at end of a turn
		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions, lockedActions) => {
				const {playerActiveRow, currentPlayer} = game.ds
				const chorusFruit = currentPlayer.custom[this.id]

				const activeIsSleeping = playerActiveRow?.ailments.some(
					(a) => a.id === 'sleeping'
				)

				const hasOtherHermit = currentPlayer.board.rows.some(
					(row, index) =>
						row.hermitCard && index !== currentPlayer.board.activeRow
				)

				if (
					chorusFruit &&
					!activeIsSleeping &&
					hasOtherHermit &&
					pastTurnActions.includes('ATTACK') &&
					!availableActions.includes('CHANGE_ACTIVE_HERMIT') &&
					!lockedActions.includes('CHANGE_ACTIVE_HERMIT')
				) {
					availableActions.push('CHANGE_ACTIVE_HERMIT')
				}
				return availableActions
			}
		)
	}
}

export default ChorusFruitSingleUseCard
