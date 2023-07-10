import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'
import {isTargetingPos} from '../../../../server/utils/attacks'
import EffectCard from './_effect-card'

class ChainmailArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'chainmail_armor',
			name: 'Chainmail Armor',
			rarity: 'common',
			description: 'Prevents damage from all effect cards.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onDefence[instance] = (attack, pickedSlots) => {
			if (!isTargetingPos(attack, pos) || attack.type !== 'effect') return

			attack.multiplyDamage(this.id, 0).lockDamage()
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onDefence[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default ChainmailArmorEffectCard
