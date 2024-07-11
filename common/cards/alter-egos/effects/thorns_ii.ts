import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {CardInstance} from '../../../types/game-state'
import {executeExtraAttacks, isTargetingPos} from '../../../utils/attacks'
import Card, {Attach, attach} from '../../base/card'

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

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		let hasTriggered = false

		opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
			if (hasTriggered) return

			if (!attack.isType('primary', 'secondary', 'effect') || attack.isBacklash) return
			// Only return a backlash attack if the attack did damage
			if (attack.calculateDamage() <= 0) return

			if (!attack.getAttacker() || !isTargetingPos(attack, pos)) return

			hasTriggered = true

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: attack.getTarget(),
				target: attack.getAttacker(),
				type: 'effect',
				isBacklash: true,
				log: (values) => `${values.target} took ${values.damage} damage from $eThorns II$`,
			}).addDamage(this.props.id, 30)

			backlashAttack.shouldIgnoreSlots.push(
				slot.hasId('gold_armor', 'iron_armor', 'diamond_armor', 'netherite_armor')
			)

			executeExtraAttacks(game, [backlashAttack])
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const triggeredKey = this.getInstanceKey(instance, 'triggered')
		opponentPlayer.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
	}
}

export default ThornsIIEffectCard
