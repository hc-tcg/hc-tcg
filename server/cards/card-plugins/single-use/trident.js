import SingleUseCard from './_single-use-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// Can't be mended if heads

class TridentSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'trident',
			name: 'Trident',
			rarity: 'rare',
			description:
				'Add 30hp damage at the end of your attack.\n\nFlip a coin.\n\nIf heads, this card is returned to your hand.',
		})
		this.damage = {target: 30}

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target) => {
			const {currentPlayer, singleUseInfo} = game.ds
			if (singleUseInfo?.id === this.id && target.isActive) {
				target.extraEffectDamage += this.damage.target
				currentPlayer.coinFlips[this.id] = flipCoin(currentPlayer)
			}
			return target
		})

		game.hooks.attackResult.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, singleUseInfo, singleUseCard} = game.ds
			if (
				singleUseInfo?.id === this.id &&
				currentPlayer.coinFlips[this.id][0] === 'heads' &&
				singleUseCard
			) {
				currentPlayer.hand.push(singleUseCard)
				currentPlayer.board.singleUseCard = null
			}
		})
	}
}

export default TridentSingleUseCard
