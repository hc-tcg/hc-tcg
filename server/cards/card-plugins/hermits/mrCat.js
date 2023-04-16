import CharacterCard from './_character-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class MrCatCharacterCard extends HermitCard {
	constructor() {
		super({
			id: 'mrCat',
			name: 'Mr. Cat',
			rarity: 'rare',
			hermitType: 'cat',
			health: 290,
			primary: {
				name: 'Attack Heli',
				cost: ['cat'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: "Teleportation",
				cost: ['cat', 'cat'],
				damage: 100,
				power:
					'After attack, Player can choose to swap Mr. Cat with AFK Character.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {attackerHermitCard, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

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
			(availableActions, pastTurnActions) => {
				const {currentPlayer} = game.ds
				const usedPower = currentPlayer.custom[this.id]
				const hasOtherHermit = currentPlayer.board.rows.some(
					(row, index) =>
						row.hermitCard && index !== currentPlayer.board.activeRow
				)
				if (
					usedPower &&
					hasOtherHermit &&
					!pastTurnActions.includes('CHANGE_ACTIVE_CHARACTER') &&
					availableActions.includes('END_TURN') &&
					!availableActions.includes('CHANGE_ACTIVE_CHARACTER')
				) {
					availableActions.push('CHANGE_ACTIVE_CHARACTER')
				}
				return availableActions
			}
		)
	}
}

export default MrCatCharacterCard
