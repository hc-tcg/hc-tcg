import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class ThornsEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns',
			name: 'Thorns',
			rarity: 'common',
			description:
				'Opposing Hermit takes +10hp damage after attack.\n\nDiscard after user is knocked out.',
		})
		this.protection = {backlash: 10}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default ThornsEffectCard
