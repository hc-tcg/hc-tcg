import EffectCard from './_effect-card'
import {getCardPos} from '../../../utils/cards'

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
		const pos = getCardPos(game, instance)
		if (!pos) return
		const {playerState, rowState} = pos
		if (!rowState) return

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
