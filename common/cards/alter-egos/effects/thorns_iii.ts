import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../types/game-state'
import {executeExtraAttacks, isTargeting} from '../../../utils/attacks'
import Card, {Attach, attach} from '../../base/card'

class ThornsIIIEffectCard extends Card {
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		let hasTriggered = false

		// Only when the opponent attacks us
		opponentPlayer.hooks.afterAttack.add(component, (attack) => {
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
				log: (values) => `${values.target} took ${values.damage} damage from $eThorns III$`,
			}).addDamage(this.props.id, 40)

			backlashAttack.shouldIgnoreSlots.push(
				slot.hasId('gold_armor', 'iron_armor', 'diamond_armor', 'netherite_armor')
			)

			executeExtraAttacks(game, [backlashAttack])
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos
		const triggeredKey = this.getInstanceKey(component, 'triggered')
		opponentPlayer.hooks.afterAttack.remove(component)
		opponentPlayer.hooks.onTurnEnd.remove(component)
	}
}

export default ThornsIIIEffectCard
