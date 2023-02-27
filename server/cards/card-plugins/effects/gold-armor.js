import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */
class GoldArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'gold_armor',
			name: 'Gold Armor',
			rarity: 'common',
			description:
				'Protects from the first +30hp damage taken.\n\nDiscard following any damage taken.',
		})
		this.protection = {target: 30, discard: true}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default GoldArmorEffectCard
