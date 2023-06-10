import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {applySingleUse} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

// We could stop displaying the coin flips but I think it may confuse players when Zedaph or Pearl uses fortune.
class FortuneSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fortune',
			name: 'Fortune',
			rarity: 'ultra_rare',
			description:
				'Any coin flips needed on your attack are not needed and "heads" is assumed.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.beforeAttack[instance] = (attack, pickedSlots) => {
			applySingleUse(game, pickedSlots)
			delete player.hooks.beforeAttack[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos

		delete player.hooks.beforeAttack[instance]
		delete player.hooks.coinFlip[instance]
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {player} = pos

		player.hooks.coinFlip[instance] = (coinFlips) => {
			for (let i = 0; i < coinFlips.length; i++) {
				coinFlips[i] = 'heads'
			}
			return coinFlips
		}
	}
}

export default FortuneSingleUseCard
