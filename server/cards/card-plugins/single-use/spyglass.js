import SingleUseCard from './_single-use-card'
import {equalCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class SpyglassSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'spyglass',
			name: 'Spyglass',
			// It is rare on HC, however with limits in online version that doesn't make too much sense
			rarity: 'common',
			description:
				"Reveal 3 random opponent's cards in their hand.\n\nDiscard after use.",
		})
	}

	/**
	 * @param {GameModel} game
	 */
	removeSpyglass(game) {
		Object.values(game.state.players).forEach((pState) => {
			delete pState.custom[this.id]
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.turnStart.tap(this.id, (action) => {
			this.removeSpyglass(game)
		})

		game.hooks.actionStart.tap(this.id, (action) => {
			this.removeSpyglass(game)
		})

		game.hooks.applyEffect.tap(this.id, (action) => {
			const {singleUseInfo, currentPlayer, opponentPlayer} = game.ds

			if (singleUseInfo?.id === this.id) {
				const randomCards = opponentPlayer.hand
					.slice()
					.sort(() => 0.5 - Math.random())
					.slice(0, 3)
				currentPlayer.custom[this.id] = randomCards
				return 'DONE'
			}
		})
	}
}

export default SpyglassSingleUseCard
