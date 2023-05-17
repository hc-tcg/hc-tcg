import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class ThornsIIIEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns_iii',
			name: 'Thorns III',
			rarity: 'ultra_rare',
			description:
				'Opposing Hermit takes +30hp damage after attack.\n\nDiscard after user is knocked out.',
		})
		this.protection = {backlash: 30}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {}
}

export default ThornsIIIEffectCard
