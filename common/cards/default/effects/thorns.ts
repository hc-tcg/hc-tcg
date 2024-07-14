import {GameModel} from '../../../models/game-model'
import {card} from '../../../components/query'
import {executeExtraAttacks} from '../../../utils/attacks'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'
import {CardComponent} from '../../../components'
import GoldArmorEffectCard from './gold-armor'
import IronArmorEffectCard from './iron-armor'
import DiamondArmorEffectCard from './diamond-armor'
import NetheriteArmorEffectCard from './netherite-armor'

class ThornsEffectCard extends Card {
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {opponentPlayer} = component
		let hasTriggered = false

		// Only when the opponent attacks us
		opponentPlayer.hooks.afterAttack.add(component, (attack) => {
			// If we have already triggered once this turn do not do so again
			if (hasTriggered) return
			if (!component.slot.inRow()) return
			if (attack.target?.entity !== component.slot.row.entity) return

			if (!attack.isType('primary', 'secondary', 'effect') || attack.isBacklash) return
			// Only return a backlash attack if the attack did damage
			if (attack.calculateDamage() <= 0) return

			hasTriggered = true

			const backlashAttack = game
				.newAttack({
					attacker: attack.target.getHermit()?.entity,
					target: component.slot.row.entity,
					type: 'effect',
					isBacklash: true,
					log: (values) => `${values.target} took ${values.damage} damage from $eThorns$`,
				})
				.addDamage(component.entity, 20)

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

export default ThornsEffectCard
