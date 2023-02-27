import SingleUseCard from './_single-use-card'
import CARDS from '../../index'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class SplashPotionOfHealingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing',
			name: 'Splash Potion of Healing',
			rarity: 'common',
			description:
				"Heals player's active and AFK Hermits +20hp.\n\nDiscard after use.",
		})

		this.useReqs = [{target: 'player', type: 'hermit', amount: 1}]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, currentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				for (let row of currentPlayer.board.rows) {
					if (!row.hermitCard) continue
					const currentRowInfo = CARDS[row.hermitCard.cardId]
					if (!currentRowInfo) continue
					row.health = Math.min(row.health + 20, currentRowInfo.health)
				}
				return 'DONE'
			}
		})
	}
}

export default SplashPotionOfHealingSingleUseCard
