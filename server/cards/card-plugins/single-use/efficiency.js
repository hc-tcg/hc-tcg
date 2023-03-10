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
			(availableActions, pastTurnActions) => {
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

					const {activeRow} = currentPlayer.board
					if (activeRow !== null) {
						availableActions.push('PRIMARY_ATTACK')
						availableActions.push('SECONDARY_ATTACK')
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
