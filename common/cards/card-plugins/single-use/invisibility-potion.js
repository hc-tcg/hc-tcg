import SingleUseCard from './_single-use-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class InvisibilityPotionSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'invisibility_potion',
			name: 'Invisibility Potion',
			rarity: 'rare',
			description:
				"Flip a coin.\n\nIf heads, your opponent's next attack misses.\n\nIf tails, it does double the damage.",
		})
	}

	canApply() {
		return true
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('server/utils/picked-cards').PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {player, opponentPlayer} = pos

		const coinFlip = flipCoin(player, this.id)
		player.coinFlips[this.id] = coinFlip

		const multiplier = coinFlip[0] === 'heads' ? 0 : 2

		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (['primary', 'secondary', 'zero'].includes(attack.type)) {
				attack.multiplyDamage(multiplier)
			}
		}

		opponentPlayer.hooks.afterAttack[instance] = () => {
			delete opponentPlayer.hooks.onAttack[instance]
			delete opponentPlayer.hooks.afterAttack[instance]
		}
	}
}

export default InvisibilityPotionSingleUseCard
