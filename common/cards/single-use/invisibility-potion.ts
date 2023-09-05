import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import SingleUseCard from '../base/single-use-card'

class InvisibilityPotionSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'invisibility_potion',
			numericId: 44,
			name: 'Invisibility Potion',
			rarity: 'rare',
			description:
				"Flip a coin.\n\nIf heads, your opponent's next attack misses.\n\nIf tails, it does double the damage.",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, (pickedSlots) => {
			const coinFlip = flipCoin(player, this.id)
			const multiplier = coinFlip[0] === 'heads' ? 0 : 2

			opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
				if (attack.isType('ailment') || attack.isBacklash) return
				attack.multiplyDamage(this.id, multiplier)
			})

			opponentPlayer.hooks.afterAttack.add(instance, () => {
				opponentPlayer.hooks.beforeAttack.remove(instance)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default InvisibilityPotionSingleUseCard
