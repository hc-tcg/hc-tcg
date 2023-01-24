import SingleUseCard from './_single-use-card'
import {applySingleUse, hasSingleUse} from '../../../utils'

class ChorusFruitSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chorus_fruit',
			name: 'Chorus Fruit',
			rarity: 'common',
			description:
				"Swap active Hermit with AFK Hermit at the end of the player's turn.\n\nDiscard after use.",
		})
	}
	register(game) {
		game.hooks.changeActiveHermit.tap(this.id, (turnAction, derivedState) => {
			const {currentPlayer, pastTurnActions} = derivedState
			const chorusFruit = hasSingleUse(currentPlayer, 'chorus_fruit')
			if (pastTurnActions.includes('ATTACK') && chorusFruit) {
				applySingleUse(currentPlayer)
			}
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, derivedState) => {
				const {pastTurnActions, currentPlayer} = derivedState
				const chorusFruit = hasSingleUse(currentPlayer, 'chorus_fruit')
				const hasOtherHermit = currentPlayer.board.rows.some(
					(row, index) =>
						row.hermitCard && index !== currentPlayer.board.activeRow
				)
				if (
					chorusFruit &&
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
