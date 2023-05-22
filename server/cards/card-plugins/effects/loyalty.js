import EffectCard from './_effect-card'
import {getCardInfo} from '../../../utils/cards'

class LoyaltyEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'loyalty',
			name: 'Loyalty',
			rarity: 'rare',
			description:
				'When the Hermit that this card is attached to is knocked out, all attached item cards are returned to your hand.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onHermitDeath(game, instance) {
		const info = getCardInfo(game, instance)
		if (!info) return
		const {playerState, rowState} = info

		for (let i = 0; i < rowState.itemCards.length; i++) {
			const card = rowState.itemCards[i]
			if (card) {
				rowState.itemCards[i] = null
				playerState.hand.push(card)
			}
		}
	}
}

export default LoyaltyEffectCard
