import SingleUseCard from './_single-use-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class InvisibilityPotionSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'invisibility_potion',
			name: 'Invisibility Potion',
			rarity: 'rare',
			description:
				"Flip a Coin.\n\nIf heads, no damage is done on opponent's next turn. If tails, double damage is done.\n\nDiscard after use.",
		})
		this.damageMultiplier = 2
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, currentPlayer, opponentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				currentPlayer.coinFlips[this.id] = flipCoin(currentPlayer, this.id)
				currentPlayer.custom[this.id] = currentPlayer.coinFlips[this.id][0]
				return 'DONE'
			}
		})

		game.hooks.attack.tap(this.id, (target) => {
			const {custom} = game.ds.opponentPlayer
			if (!custom[this.id]) return target

			if (custom[this.id] === 'heads') {
				target.hermitMultiplier *= 0
				target.effectMultiplier *= 0
			} else if (custom[this.id] === 'tails') {
				target.hermitMultiplier = this.damageMultiplier
				target.effectMultiplier = this.damageMultiplier
			}
			return target
		})

		game.hooks.turnEnd.tap(this.id, () => {
			const {custom} = game.ds.opponentPlayer
			if (custom[this.id]) delete custom[this.id]
		})
	}
}

export default InvisibilityPotionSingleUseCard
