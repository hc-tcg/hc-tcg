import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */
class DiamondArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'diamond_armor',
			name: 'Diamond Armor',
			rarity: 'rare',
			description:
				'Protects from the first +30hp damage.\n\nDiscard after user is knocked out.',
		})
		this.protection = {target: 30}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default DiamondArmorEffectCard
