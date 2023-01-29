import HermitCard from './_hermit-card'

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
				damage: 60,
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

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, currentPlayer, typeAction} = derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target

			if (attackerHermitCard.cardId === this.id) {
				currentPlayer.custom[this.id] = true
			}
			return target
		})

		game.hooks.changeActiveHermit.tap(this.id, (turnAction, derivedState) => {
			const {currentPlayer} = derivedState
			const usedPower = currentPlayer.custom[this.id]
			if (usedPower) {
				delete currentPlayer.custom[this.id]
			}
		})

		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			delete currentPlayer.custom[this.id]
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, derivedState) => {
				const {pastTurnActions, currentPlayer} = derivedState
				const usedPower = currentPlayer.custom[this.id]
				const hasOtherHermit = currentPlayer.board.rows.some(
					(row, index) =>
						row.hermitCard && index !== currentPlayer.board.activeRow
				)
				if (
					usedPower &&
					hasOtherHermit &&
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

export default Cubfan135RareHermitCard
