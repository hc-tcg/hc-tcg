import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import SingleUseCard from '../../base/single-use-card'

class InvisibilityPotionSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'invisibility_potion',
			numericId: 44,
			name: 'Invisibility Potion',
			rarity: 'rare',
			description:
				"Flip a coin.\nIf heads, your opponent's next attack misses. If tails, their attack damage doubles.",
			log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const usedKey = this.getInstanceKey(instance, 'used')

		player.hooks.onApply.add(instance, () => {
			const coinFlip = flipCoin(player, {cardId: this.id, cardInstance: instance})
			const multiplier = coinFlip[0] === 'heads' ? 0 : 2

			opponentPlayer.hooks.beforeAttack.add(instance, (attack) => {
				if (attack.isType('weakness', 'effect', 'status-effect')) return

				player.custom[usedKey] = true
				attack.multiplyDamage(this.id, multiplier)
			})

			opponentPlayer.hooks.afterAttack.add(instance, () => {
				if (!player.custom[usedKey]) return
				delete player.custom[usedKey]

				opponentPlayer.hooks.afterAttack.remove(instance)
				opponentPlayer.hooks.beforeAttack.remove(instance)

				game.battleLog.addEntry(player.id, `$eInvisibility Potion$ wore off`)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override sidebarDescriptions() {
		return [
			{
				type: 'glossary',
				name: 'missed',
			},
		]
	}
}

export default InvisibilityPotionSingleUseCard
