import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {moveCardToHand} from '../../utils/movement'
import EffectCard from '../base/effect-card'

class LoyaltyEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'loyalty',
			numeric_id: 77,
			name: 'Loyalty',
			rarity: 'rare',
			description:
				'When the Hermit that this card is attached to is knocked out, all attached item cards are returned to your hand.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onHermitDeath.add(instance, (hermitPos) => {
			if (hermitPos.rowIndex === null || !hermitPos.row) return
			if (hermitPos.rowIndex !== pos.rowIndex) return

			// Return all attached item cards to the hand
			const row = hermitPos.row
			for (let i = 0; i < row.itemCards.length; i++) {
				const card = row.itemCards[i]
				if (card) {
					moveCardToHand(game, card)
				}
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onHermitDeath.remove(instance)
	}
}

export default LoyaltyEffectCard
