import HermitCard from './_hermit-card'
import {GameModel} from '../../../../server/models/game-model'

class Cubfan135RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'cubfan135_rare',
			name: 'Cub',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 260,
			primary: {
				name: 'Dash',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: "Let's Go",
				cost: ['speedrunner', 'speedrunner', 'speedrunner'],
				damage: 100,
				power: 'After attack, you can choose to go afk.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds
		const instanceKey = this.getInstanceKey(instance)

		currentPlayer.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.id || attack.type !== 'secondary') return

			// We used our secondary attack, activate power
			currentPlayer.custom[instanceKey] = true
		}

		currentPlayer.hooks.availableActions[instance] = (availableActions) => {
			if (currentPlayer.custom[instanceKey]) {
				// Only activate if we have other hermit and we haven't already switched
				const hasOtherHermit = currentPlayer.board.rows.some((row, index) => {
					return row.hermitCard && index !== currentPlayer.board.activeRow
				})
				const pastTurnActions = game.turnState.pastTurnActions

				//@TODO do we also need tocheck for end_turn here?
				if (
					hasOtherHermit &&
					!pastTurnActions.includes('CHANGE_ACTIVE_HERMIT') &&
					!availableActions.includes('CHANGE_ACTIVE_HERMIT')
				) {
					availableActions.push('CHANGE_ACTIVE_HERMIT')
				}
			}

			return availableActions
		}

		currentPlayer.hooks.turnEnd[instance] = () => {
			// Cleanup
			delete currentPlayer.custom[instanceKey]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		const instanceKey = this.getInstanceKey(instance)

		// Remove all hooks and flags
		delete currentPlayer.hooks.onAttack[instance]
		delete currentPlayer.hooks.availableActions[instance]
		delete currentPlayer.hooks.turnEnd[instance]
		delete currentPlayer.custom[instanceKey]
	}
}

export default Cubfan135RareHermitCard
