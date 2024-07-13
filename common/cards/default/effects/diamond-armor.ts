import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'

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

	override onAttach(_game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		let damageBlocked = 0

		player.hooks.onDefence.add(component, (attack) => {
			if (
				!component.slot.inRow() ||
				attack.target?.entity !== component.slot.row.entity ||
				attack.isType('status-effect')
			)
				return

			if (damageBlocked < 30) {
				const damageReduction = Math.min(attack.calculateDamage(), 30 - damageBlocked)
				damageBlocked += damageReduction
				attack.reduceDamage(component.entity, damageReduction)
			}
		})

		const resetCounter = () => {
			damageBlocked = 0
		}

		// Reset counter at the start of every turn
		player.hooks.onTurnStart.add(component, resetCounter)
		opponentPlayer.hooks.onTurnStart.add(component, resetCounter)
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component
		player.hooks.onDefence.remove(component)
		player.hooks.onTurnStart.remove(component)
		opponentPlayer.hooks.onTurnStart.remove(component)
	}
}

export default DiamondArmorEffectCard
