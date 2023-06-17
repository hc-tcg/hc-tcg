import EffectCard from './_effect-card'
import {removeCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onHermitDeath[instance] = (hermitPos) => {
			if (!hermitPos.rowIndex || !hermitPos.row) return
			if (hermitPos.rowIndex !== pos.rowIndex) return

			// Return all attached item cards to the hand
			const row = hermitPos.row
			for (let i = 0; i < row.itemCards.length; i++) {
				const card = row.itemCards[i]
				if (card) {
					removeCard(game, card)
					player.hand.push(card)
				}
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onHermitDeath[instance]
	}
}

export default LoyaltyEffectCard
