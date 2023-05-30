import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class WolfEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wolf',
			name: 'Wolf',
			rarity: 'rare',
			description:
				'Opponent takes +20hp damage every time user is attacked until user is knocked out.\n\nDiscard after user is knocked out.',
		})
		this.protection = {backlash: 20}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default WolfEffectCard
