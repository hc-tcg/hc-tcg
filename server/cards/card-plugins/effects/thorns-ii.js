import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class ThornsIIEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns_ii',
			name: 'Thorns II',
			rarity: 'rare',
			description:
				'Opposing Hermit takes +20hp damage after attack.\n\nDiscard after user is knocked out.',
		})
		this.protection = {backlash: 20}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default ThornsIIEffectCard
