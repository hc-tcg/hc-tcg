import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {executeExtraAttacks} from '../../../utils/attacks'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'
import {card} from '../../../components/query'
import GoldArmor from '../../default/effects/gold-armor'
import IronArmor from '../../default/effects/iron-armor'
import DiamondArmor from '../../default/effects/diamond-armor'
import NetheriteArmor from '../../default/effects/netherite-armor'

class ThornsIII extends Card {
	props: Attach = {
		...attach,
		id: 'thorns_iii',
		numericId: 124,
		name: 'Thorns III',
		expansion: 'alter_egos',
		rarity: 'ultra_rare',
		tokens: 4,
		description:
			"When the Hermit this card is attached to takes damage, your opponent's active Hermit takes 40hp damage.\nIgnores armour.",
	}

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {opponentPlayer} = component
		let hasTriggered = false

		// Only when the opponent attacks us
		opponentPlayer.hooks.afterAttack.add(component, (attack) => {
			// If we have already triggered once this turn do not do so again
			if (hasTriggered) return
			if (!component.slot.inRow()) return
			if (!attack.isTargetting(component)) return

			if (!attack.isType('primary', 'secondary', 'effect') || attack.isBacklash) return
			// Only return a backlash attack if the attack did damage
			if (attack.calculateDamage() <= 0) return

			hasTriggered = true

			const backlashAttack = game
				.newAttack({
					attacker: component.entity,
					target: component.slot.row.entity,
					type: 'effect',
					isBacklash: true,
					log: (values) => `${values.target} took ${values.damage} damage from $eThorns$`,
				})
				.addDamage(component.entity, 40)

			backlashAttack.shouldIgnoreCards.push(
				card.is(GoldArmor, IronArmor, DiamondArmor, NetheriteArmor)
			)

			executeExtraAttacks(game, [backlashAttack])
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {opponentPlayer} = component
		opponentPlayer.hooks.afterAttack.remove(component)
		opponentPlayer.hooks.onTurnEnd.remove(component)
	}
}

export default ThornsIII
