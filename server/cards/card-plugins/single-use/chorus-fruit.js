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
		game.hooks.changeActiveHermit.tap(this.id, (turnAction, actionState) => {
			const {currentPlayer} = game.ds
			const {pastTurnActions} = actionState
			const chorusFruit = hasSingleUse(currentPlayer, 'chorus_fruit')
			if (pastTurnActions.includes('ATTACK') && chorusFruit) {
				applySingleUse(currentPlayer)
			}
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions) => {
				const {playerActiveRow, currentPlayer} = game.ds
				const chorusFruit = hasSingleUse(currentPlayer, 'chorus_fruit')

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
					!pastTurnActions.includes('CHANGE_ACTIVE_HERMIT') &&
					!availableActions.push('CHANGE_ACTIVE_HERMIT')
				) {
					availableActions.push('CHANGE_ACTIVE_HERMIT')
				}
				return availableActions
			}
		)
	}
}

export default ChorusFruitSingleUseCard
