import SingleUseCard from './_single-use-card'
import {HERMIT_CARDS} from '../../index'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class SplashPotionOfHealingIISingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing_ii',
			name: 'Splash Potion of Healing II',
			rarity: 'rare',
			description: "Heals player's active and AFK Hermits +30hp.",
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
					const currentRowInfo = HERMIT_CARDS[row.hermitCard.cardId]
					if (!currentRowInfo) continue
					row.health = Math.min(row.health + 30, currentRowInfo.health)
				}
				return 'DONE'
			}
		})
	}
}

export default SplashPotionOfHealingIISingleUseCard
