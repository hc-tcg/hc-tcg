import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */
class WallOfFruitEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wall_of_fruit',
			name: 'Wall of Fruit',
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

export default WallOfFruitEffectCard
