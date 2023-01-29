import HermitCard from './_hermit-card'

class BdoubleO100RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'bdoubleo100_rare',
			name: 'Bdubs',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 260,
			primary: {
				name: 'Retexture',
				cost: ['any'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Shreep',
				cost: ['balanced', 'balanced', 'any'],
				damage: 0,
				power:
					"Bdubs sleeps for the next 2 turns. Can't attack. Restores Full health.\n\nCan still draw and attach cards while sleeping.\n\nCan't be used consecutively.",
			},
		})

		this.turnDuration = 2
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, attackerActiveRow, currentPlayer, typeAction} =
				derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target

			// e.g. if bed was used
			if (attackerActiveRow.ailments.includes('sleeping')) return target

			if (attackerHermitCard.cardId === this.id) {
				attackerActiveRow.ailments.push('sleeping')
				attackerHermitCard.sleeping = this.turnDuration
			}
			return target
		})

		// Reduce counter every turn and set health to max once at 0
		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {currentPlayer, availableActions} = derivedState

			for (let row of currentPlayer.board.rows) {
				if (row.hermitCard?.cardId !== this.id) continue
				const sleeping = row.hermitCard.sleeping
				if (sleeping && sleeping > 0) {
					row.hermitCard.sleeping--
				} else if (sleeping === 0) {
					row.health = this.health
					row.ailments = row.ailments.filter((a) => a != 'sleeping')
					delete row.hermitCard.sleeping
				}
			}
		})

		// Disable attack actions while counter is >0
		game.hooks.availableActions.tap(
			this.id,
			(availableActions, derivedState) => {
				const {currentPlayer} = derivedState
				const activeRow =
					currentPlayer.board.rows[currentPlayer.board.activeRow]

				if (!activeRow || activeRow.hermitCard?.cardId !== this.id)
					return availableActions

				const bdubsSleeping = activeRow.hermitCard?.hasOwnProperty('sleeping')
				console.log('@bdubsSleeping: ', bdubsSleeping)

				const attackActions = [
					'ZERO_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
				]
				return bdubsSleeping
					? availableActions.filter((action) => !attackActions.includes(action))
					: availableActions
			}
		)
	}
}

export default BdoubleO100RareHermitCard
