import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {executeExtraAttacks, isTargeting} from '../../../utils/attacks'
import Card, {Attach} from '../../base/card'
import {attach} from '../../base/defaults'
import {CardComponent} from '../../../components'

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
		const {opponentPlayer} = pos
		let hasTriggered = false

		// Only when the opponent attacks us
		opponentPlayer.hooks.afterAttack.add(component, (attack) => {
			// If we have already triggered once this turn do not do so again
			if (hasTriggered) return

			if (!attack.isType('primary', 'secondary', 'effect') || attack.isBacklash) return
			// Only return a backlash attack if the attack did damage
			if (attack.calculateDamage() <= 0) return

			if (!attack.getAttacker() || !isTargeting(attack, pos)) return

			hasTriggered = true

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(component, 'backlash'),
				attacker: attack.getTarget(),
				target: attack.getAttacker(),
				type: 'effect',
				isBacklash: true,
				log: (values) => `${values.target} took ${values.damage} damage from $eThorns$`,
			}).addDamage(this.props.id, 20)

			backlashAttack.shouldIgnoreSlots.push(
				slot.hasId('gold_armor', 'iron_armor', 'diamond_armor', 'netherite_armor')
			)

			executeExtraAttacks(game, [backlashAttack])
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {opponentPlayer} = pos
		opponentPlayer.hooks.afterAttack.remove(component)
		opponentPlayer.hooks.onTurnEnd.remove(component)
	}
}

export default ThornsEffectCard
