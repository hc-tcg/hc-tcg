import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */
class RubberChickenEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'rubber_chicken',
			name: 'Rubber Chicken',
			rarity: 'common',
			description:
				'Protects from the first +20hp damage taken.\n\nDiscard after user is knocked out.',
		})
		this.protection = {target: 20}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default RubberChickenEffectCard
