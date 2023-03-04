import HermitCard from './_hermit-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// TODO - can't be used consecutively
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

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, playerHermitInfo} = game.ds
			const {attacker, moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target
			// shreep - instantly heal to max hp

			// e.g. if bed was used
			if (attacker.row.ailments.find((a) => a.id === 'sleeping')) return target

			// store current turn to disable Shreep for one turn when it is over
			const conInfo = currentPlayer.custom[this.id] || {}
			conInfo[attacker.hermitCard.cardInstance] = game.state.turn
			currentPlayer.custom[this.id] = conInfo

			attacker.row.health = attacker.hermitInfo.health
			attacker.row.ailments = attacker.row.ailments.filter(
				(a) => a.id !== 'sleeping'
			)
			attacker.row.ailments.push({id: 'sleeping', duration: 2})
		})

		// Disable shreep attack consecutively
		game.hooks.availableActions.tap(this.id, (availableActions) => {
			const {currentPlayer, playerActiveRow} = game.ds

			// we must have active hermit
			const activeHermit = playerActiveRow?.hermitCard
			if (!activeHermit || activeHermit?.cardId !== this.id)
				return availableActions

			// we want to make changes only if shreep was used by the hermit
			const conInfo = currentPlayer.custom[this.id]
			const lastTurnUsed = conInfo?.[activeHermit.cardInstance]
			if (typeof lastTurnUsed !== 'number') return availableActions

			// Prevent use of shreep consecutively
			const consecutive = lastTurnUsed + 6 >= game.state.turn
			if (!consecutive) {
				delete conInfo[activeHermit.cardInstance]
				return availableActions
			}

			return availableActions.filter((a) => a !== 'SECONDARY_ATTACK')
		})
	}
}

export default BdoubleO100RareHermitCard
