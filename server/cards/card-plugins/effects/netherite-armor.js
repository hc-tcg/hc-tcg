import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class NetheriteArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'netherite_armor',
			name: 'Netherite Armor',
			rarity: 'ultra_rare',
			description:
				'Protects from the first +40hp damage.\n\nDiscard after user is knocked out.',
		})
		this.protection = {target: 40}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default NetheriteArmorEffectCard
