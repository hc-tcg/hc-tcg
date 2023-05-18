import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class BadOmenSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bad_omen',
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
			const {singleUseInfo, opponentActiveRow, opponentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				const hasMilkBucket =
					opponentActiveRow?.effectCard?.cardId === 'milk_bucket'
				if (!hasMilkBucket) {
					const rows = opponentPlayer.board.rows
					for (let i = 0; i < rows.length; i++) {
						const row = rows[i]
						row.ailments.push({id: 'badomen', duration: 3})
					}
				}
				return 'DONE'
			}
		})
	}
}

export default BadOmenSingleUseCard
