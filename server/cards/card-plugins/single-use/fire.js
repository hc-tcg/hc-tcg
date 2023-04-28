import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class FireSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fire',
			name: 'Fire',
			rarity: 'rare',
			description:
				'BURNS the opposing Hermit\n\nDoes an additional +20hp damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the BURN. Discard after use.',
		})

		this.useReqs = [
			{target: 'opponent', type: 'character', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, opponentActiveRow, opponentEffectCardInfo} = game.ds
			if (singleUseInfo?.id === this.id) {
				if (opponentActiveRow === null) return 'INVALID'
				if (opponentEffectCardInfo?.id !== 'fire_truck') {
					opponentActiveRow.ailments.push({id: 'fire', duration: -1})
				}
				return 'DONE'
			}
		})
	}
}

export default FireSingleUseCard
