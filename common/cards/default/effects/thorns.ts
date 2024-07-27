import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import {executeExtraAttacks} from '../../../utils/attacks'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'
import {CardComponent, ObserverComponent} from '../../../components'
import GoldArmor from './gold-armor'
import IronArmor from './iron-armor'
import DiamondArmor from './diamond-armor'
import NetheriteArmor from './netherite-armor'

class Thorns extends Card {
	props: Attach = {
		...attach,
		id: 'thorns',
		numericId: 96,
		name: 'Thorns',
		expansion: 'default',
		rarity: 'common',
		tokens: 2,
		description:
			"When the Hermit this card is attached to takes damage, your opponent's active Hermit takes 20hp damage.\nIgnores armour.",
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {opponentPlayer} = component
		let hasTriggered = false

		// Only when the opponent attacks us
		observer.subscribe(opponentPlayer.hooks.afterAttack, (attack) => {
			// If we have already triggered once this turn do not do so again
			if (hasTriggered) return
			if (!component.slot.inRow()) return
			if (!attack.isTargeting(component)) return

			if (!attack.isType('primary', 'secondary', 'effect') || attack.isBacklash) return
			// Only return a backlash attack if the attack did damage
			if (attack.calculateDamage() <= 0) return

			if (!(attack.attacker instanceof CardComponent)) return
			if (!attack.attacker.slot.inRow()) return

			hasTriggered = true

			const backlashAttack = game
				.newAttack({
					attacker: component.entity,
					target: attack.attacker.slot.rowEntity,
					type: 'effect',
					isBacklash: true,
					log: (values) => `${values.target} took ${values.damage} damage from $eThorns$`,
				})
				.addDamage(component.entity, 20)

			backlashAttack.shouldIgnoreCards.push(
				query.card.is(GoldArmor, IronArmor, DiamondArmor, NetheriteArmor)
			)

			executeExtraAttacks(game, [backlashAttack])
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			hasTriggered = false
		})
	}
}

export default Thorns
