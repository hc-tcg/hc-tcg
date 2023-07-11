import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {discardCard} from '../../../../server/utils'
import {isTargetingPos} from '../../../../server/utils/attacks'

class TotemEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'totem',
			name: 'Totem',
			rarity: 'ultra_rare',
			description:
				'Recover 10hp and remain in battle after you are knocked out.\n\nDoes not count as a knockout. Discard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		// If we are attacked from any source
		player.hooks.afterDefence[instance] = (attack) => {
			if (!isTargetingPos(attack, pos) || !attack.target) return
			const {row} = attack.target
			if (row.health) return

			row.health = 10
			row.ailments = []

			// This will remove this hook, so it'll only be called once
			discardCard(game, row.effectCard)
		}
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		delete pos.player.hooks.afterDefence[instance]
	}
}

export default TotemEffectCard
