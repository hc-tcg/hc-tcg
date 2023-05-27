import HermitCard from './_hermit-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

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
				power:
					'After attack, Player can choose to swap Cubfan with AFK Hermit.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			currentPlayer.custom[this.id] = true
			return target
		})

		game.hooks.changeActiveHermit.tap(this.id, () => {
			const {currentPlayer} = game.ds
			const usedPower = currentPlayer.custom[this.id]
			if (usedPower) {
				delete currentPlayer.custom[this.id]
			}
		})

		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions, lockedActions) => {
				const {currentPlayer} = game.ds
				const usedPower = currentPlayer.custom[this.id]
				const hasOtherHermit = currentPlayer.board.rows.some(
					(row, index) =>
						row.hermitCard && index !== currentPlayer.board.activeRow
				)
				if (
					usedPower &&
					hasOtherHermit &&
					!pastTurnActions.includes('CHANGE_ACTIVE_HERMIT') &&
					!lockedActions.includes('CHANGE_ACTIVE_HERMIT') &&
					availableActions.includes('END_TURN') &&
					!availableActions.includes('CHANGE_ACTIVE_HERMIT')
				) {
					availableActions.push('CHANGE_ACTIVE_HERMIT')
				}
				return availableActions
			}
		)
	}
}

export default Cubfan135RareHermitCard
