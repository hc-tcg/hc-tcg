import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class BadOmenSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bad-omen',
			name: 'Bad Omen',
			rarity: 'rare',
			description: `All of your opponent's coin flips are tails for the next 3 turns.`,
		})

		this.useReqs = [{target: 'opponent', type: 'hermit', amount: 1}]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, opponentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				opponentPlayer.ailments.push({id: 'badomen', duration: 3})
				return 'DONE'
			}
		})
	}
}

export default BadOmenSingleUseCard
