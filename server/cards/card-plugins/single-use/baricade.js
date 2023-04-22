import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class BaricadeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'baricade',
			name: 'Baricade',
			rarity: 'common',
			description:
				'Opposing active Character can not go to the bench on the following turn.\n\nDiscard after use.',
		})

		this.useReqs = [
			{target: 'opponent', type: 'character', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// set flag on opponent player
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, opponentPlayer} = game.ds

			if (singleUseInfo?.id === this.id) {
				opponentPlayer.custom[this.id] = true
				return 'DONE'
			}
		})

		// if flag is true, remove change of active hermit from available actions
		game.hooks.availableActions.tap(this.id, (availableActions) => {
			const {singleUseInfo, currentPlayer} = game.ds
			if (!currentPlayer.custom[this.id]) return availableActions
			if (currentPlayer.board.activeRow === null) return availableActions

			return availableActions.filter(
				(action) => action !== 'CHANGE_ACTIVE_CHARACTER'
			)
		})

		// at end of turn remove flag
		game.hooks.turnEnd.tap(this.id, () => {
			const {currentPlayer} = game.ds
			delete currentPlayer.custom[this.id]
		})
	}
}

export default BaricadeSingleUseCard
