import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {executeExtraAttacks, isTargetingPos} from '../../../utils/attacks'
import EffectCard from '../../base/effect-card'

class ThornsIIEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns_ii',
			numericId: 123,
			name: 'Thorns II',
			rarity: 'rare',
			description:
				"When the Hermit this card is attached to takes damage, your opponent's active Hermit takes 30hp damage.\nIgnores armour.",
		})
	}
	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const triggeredKey = this.getInstanceKey(instance, 'triggered')

		// Only when the opponent attacks us
		opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
			// If we have already triggered once this turn do not do so again
			if (player.custom[triggeredKey]) return

			if (!attack.isType('primary', 'secondary', 'effect') || attack.isBacklash) return
			// Only return a backlash attack if the attack did damage
			if (attack.calculateDamage() <= 0) return

			if (!attack.getAttacker() || !isTargetingPos(attack, pos)) return

			player.custom[triggeredKey] = true

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: attack.getTarget(),
				target: attack.getAttacker(),
				type: 'effect',
				isBacklash: true,
				log: (values) => `${values.target} took ${values.damage} damage from $eThorns II$`,
			}).addDamage(this.id, 30)

			backlashAttack.shouldIgnoreSlots.push(
				slot.has('gold_armor', 'iron_armor', 'diamond_armor', 'netherite_armor')
			)

			executeExtraAttacks(game, [backlashAttack])
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[triggeredKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const triggeredKey = this.getInstanceKey(instance, 'triggered')
		opponentPlayer.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[triggeredKey]
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default ThornsIIEffectCard
