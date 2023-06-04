import {AttackModel} from '../../../../server/models/attack-model'
import {GameModel} from '../../../../server/models/game-model'
import {getCardPos} from '../../../../server/utils/cards'
import EffectCard from './_effect-card'

class IronArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'iron_armor',
			name: 'Iron Armor',
			rarity: 'common',
			description:
				'Protects from the first +20hp damage taken.\n\nDiscard after user is knocked out.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {opponentPlayer} = game.ds
		const pos = getCardPos(game, instance)
		if (!pos) return

		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (attack.target.index !== pos.rowIndex) return

			// reduce damage here
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {opponentPlayer} = game.ds
		delete opponentPlayer.hooks.onAttack[instance]
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	onDefence(game, instance, attack) {
		if (['primary', 'secondary', 'zero'].includes(attack.type)) {
			attack.defence.damageReduction += 20
		}

		return attack
	}
}

export default IronArmorEffectCard
