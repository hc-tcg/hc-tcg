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
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const coinFlip = flipCoin(player, this.id)
			const multiplier = coinFlip[0] === 'heads' ? 0 : 2

			opponentPlayer.hooks.onAttack.add(instance, (attack) => {
				if (attack.isType('ailment') || attack.isBacklash) return
				attack.multiplyDamage(this.id, multiplier)
			})

			opponentPlayer.hooks.afterAttack.add(instance, () => {
				opponentPlayer.hooks.onAttack.remove(instance)
				opponentPlayer.hooks.afterAttack.remove(instance)
			})
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default InvisibilityPotionSingleUseCard
