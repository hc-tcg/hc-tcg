import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class ClockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'clock',
			name: 'Clock',
			rarity: 'ultra_rare',
			description: 'Opponent skips their next turn.\n\nDiscard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.turnStart.tap(this.id, (turnConfig) => {
			const {currentPlayer} = game.ds
			if (currentPlayer.custom[this.id]) {
				delete currentPlayer.custom[this.id]
				turnConfig.skipTurn = true
			}
		})

		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, opponentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				if (game.state.turn < 2) {
					return 'INVALID'
				}
				opponentPlayer.custom[this.id] = true
				return 'DONE'
			}
		})
	}
}

export default ClockSingleUseCard
