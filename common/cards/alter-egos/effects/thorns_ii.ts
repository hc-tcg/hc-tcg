import {GameModel} from '../../../models/game-model'
import {card} from '../../../components/query'
import {CardComponent} from '../../../components'
import {executeExtraAttacks} from '../../../utils/attacks'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'
import GoldArmorEffectCard from '../../default/effects/gold-armor'
import IronArmorEffectCard from '../../default/effects/iron-armor'
import DiamondArmorEffectCard from '../../default/effects/diamond-armor'
import NetheriteArmorEffectCard from '../../default/effects/netherite-armor'

class ThornsIIEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'thorns_ii',
		numericId: 123,
		name: 'Thorns II',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 3,
		description:
			"When the Hermit this card is attached to takes damage, your opponent's active Hermit takes 30hp damage.\nIgnores armour.",
	}

	override onAttach(game: GameModel, component: CardComponent) {
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
					attacker: attack.target?.getHermit()?.entity,
					target: component.slot.row.entity,
					type: 'effect',
					isBacklash: true,
					log: (values) => `${values.target} took ${values.damage} damage from $eThorns$`,
				})
				.addDamage(component.entity, 30)

			backlashAttack.shouldIgnoreCards.push(
				card.is(
					GoldArmorEffectCard,
					IronArmorEffectCard,
					DiamondArmorEffectCard,
					NetheriteArmorEffectCard
				)
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

export default ThornsIIEffectCard
