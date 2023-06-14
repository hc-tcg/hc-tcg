import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'

class TotemEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'totem',
			name: 'Totem',
			rarity: 'ultra_rare',
			description:
				'Recover 10hp and remain in battle after you are knocked out.\nDoes not count as a knockout. Discard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		pos.otherPlayer.hooks.afterAttack[instance] = (result) => {
			if (!result.attack.target.row || result.attack.target.row.health > 0)
				return
			if (result.attack.target.row.effectCard?.cardInstance !== instance) return

			result.attack.target.row.health = 10
			result.attack.target.row.ailments = []
			result.attack.target.row.effectCard = null
		}
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		delete pos.otherPlayer.hooks.afterAttack[instance]
	}
}

export default TotemEffectCard
