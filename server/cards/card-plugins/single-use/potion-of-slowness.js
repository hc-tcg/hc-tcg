import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class PotionOfSlownessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_slowness',
			name: 'Potion of Slowness',
			rarity: 'common',
			description:
				"Opponent's active hermit can only use their primary attack on their next turn.\n\nDiscard after use.",
		})

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, opponentActiveRow} = game.ds
			if (singleUseInfo?.id === this.id) {
				if (opponentActiveRow === null) return 'INVALID'
				opponentActiveRow.ailments.push({id: 'slowness', duration: 1})
				return 'DONE'
			}
		})
	}
}

export default PotionOfSlownessSingleUseCard
