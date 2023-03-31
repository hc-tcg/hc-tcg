import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class EfficiencySingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'efficiency',
			name: 'Efficiency',
			rarity: 'rare',
			description:
				'User can execute attack without having the necessary item cards attached.\n\nCurrent turn only.\n\nDiscard after use.',
		})

		this.useReqs = [{target: 'player', type: 'hermit', amount: 1, active: true}]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.availableActions.tap(
			this.id,
			(availableActions, pastTurnActions, lockedActions) => {
				const {currentPlayer} = game.ds
				const efficiency = currentPlayer.custom[this.id]
				if (efficiency) {
					if (
						pastTurnActions.includes('ATTACK') ||
						pastTurnActions.includes('CHANGE_ACTIVE_HERMIT') ||
						game.state.turn <= 1
					) {
						return availableActions
					}

					const {activeRow, rows} = currentPlayer.board
					if (activeRow === null || !rows[activeRow]) return availableActions
					const ailments = rows[activeRow].ailments
					const isSleeping = ailments.find((a) => a.id === 'sleeping')
					const isSlow = ailments.find((a) => a.id === 'slowness')

					if (!isSleeping) {
						if (!lockedActions.includes('PRIMARY_ATTACK')) {
							availableActions.push('PRIMARY_ATTACK')
						}

						if (!isSlow && !lockedActions.includes('SECONDARY_ATTACK')) {
							availableActions.push('SECONDARY_ATTACK')
						}
					}
				}
				return availableActions
			}
		)

		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, currentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				currentPlayer.custom[this.id] = true
				return 'DONE'
			}
		})

		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})
	}
}

export default EfficiencySingleUseCard
