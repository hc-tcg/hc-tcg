import {AttackModel} from '../../../models/attack-model'
import {CardPosModel, getCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {isTargetingPos} from '../../../utils/attacks'
import EffectCard from '../../base/effect-card'

class ThornsIIEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns_ii',
			numericId: 123,
			name: 'Thorns II',
			rarity: 'rare',
			description:
				'When the Hermit this card is attached to takes damage, your opponent takes 30hp damage.\n\nIgnores armor.',
		})
	}
	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const triggeredKey = this.getInstanceKey(instance, 'triggered')

		// Only when the opponent attacks us
		opponentPlayer.hooks.onAttack.add(instance, (attack) => {
			// If we have already triggered once this turn do not do so again
			if (player.custom[triggeredKey]) return

			if (!attack.isType('primary', 'secondary', 'effect') || attack.isBacklash) return
			// Only return a backlash attack if the attack would do damage
			if (attack.calculateDamage() <= 0) return

			if (attack.getAttacker() && isTargetingPos(attack, pos)) {
				player.custom[triggeredKey] = true

				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					attacker: attack.getTarget(),
					target: attack.getAttacker(),
					type: 'effect',
					isBacklash: true,
				}).addDamage(this.id, 30)

				backlashAttack.shouldIgnoreCards.push((instance) => {
					const pos = getCardPos(game, instance)
					if (!pos || !pos.row || !pos.row.effectCard) return false

					if (
						['gold_armor', 'iron_armor', 'diamond_armor', 'netherite_armor'].includes(
							pos.row.effectCard.cardId
						)
					) {
						// It's an armor card, ignore it
						return true
					}

					return false
				})

				attack.addNewAttack(backlashAttack)
			}

			return attack
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[triggeredKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const triggeredKey = this.getInstanceKey(instance, 'triggered')
		opponentPlayer.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[triggeredKey]
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default ThornsIIEffectCard
