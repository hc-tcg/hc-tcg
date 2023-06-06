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
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		game.hooks.hermitDeath.tap(this.id, (recovery, deathInfo) => {
			if (deathInfo.row.effectCard?.cardInstance === instance) {
				recovery.push({
					amount: 10,
					discardEffect: true,
				})
			}
			return recovery
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		delete currentPlayer.hooks.afterAttack[instance]
	}
}

export default TotemEffectCard
