import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {isTargeting} from '../../../utils/attacks'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'

class GoldArmorEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'gold_armor',
		numericId: 29,
		name: 'Gold Armour',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description:
			'When the Hermit this card is attached to takes damage, that damage is reduced by up to 10hp each turn.',
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		let damageBlocked = 0

		player.hooks.onDefence.add(component, (attack) => {
			if (!isTargeting(attack, pos) || attack.isType('status-effect')) return

			if (damageBlocked < 10) {
				const damageReduction = Math.min(attack.calculateDamage(), 10 - damageBlocked)
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

	override onDetach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component
		player.hooks.onDefence.remove(component)
		player.hooks.onTurnStart.remove(component)
		opponentPlayer.hooks.onTurnStart.remove(component)
	}
}

export default GoldArmorEffectCard
