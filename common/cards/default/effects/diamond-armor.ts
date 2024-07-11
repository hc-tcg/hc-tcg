import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import Card, {Attach, attach} from '../../base/card'

class DiamondArmorEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'diamond_armor',
		numericId: 13,
		name: 'Diamond Armour',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		description:
			'When the Hermit this card is attached to takes damage, that damage is reduced by up to 30hp each turn.',
	}

	override onAttach(game: GameModel, instance: CardComponent) {
		const {player, opponentPlayer} = instance

		let damageBlocked = 0

		player.hooks.onDefence.add(instance, (attack) => {
			if (!attack.isType('status-effect')) return

			if (damageBlocked < 30) {
				const damageReduction = Math.min(attack.calculateDamage(), 30 - damageBlocked)
				damageBlocked += damageReduction
				attack.reduceDamage(instance.entity, damageReduction)
			}
		})

		const resetCounter = () => {
			damageBlocked = 0
		}

		// Reset counter at the start of every turn
		player.hooks.onTurnStart.add(instance, resetCounter)
		opponentPlayer.hooks.onTurnStart.add(instance, resetCounter)
	}

	override onDetach(game: GameModel, instance: CardComponent) {
		const {player, opponentPlayer} = instance
		player.hooks.onDefence.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.onTurnStart.remove(instance)
	}
}

export default DiamondArmorEffectCard
