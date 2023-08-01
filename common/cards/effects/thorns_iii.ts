import {AttackModel} from '../../models/attack-model'
import {CardPosModel, getCardPos} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isTargetingPos} from '../../utils/attacks'
import EffectCard from '../base/effect-card'

class ThornsIIIEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns_iii',
			name: 'Thorns III',
			rarity: 'ultra_rare',
			description:
				'When the Hermit this card is attached to takes damage, your opponent takes 40hp damage.\n\nIgnores armor.',
		})
	}
	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer} = pos

		// Only when the opponent attacks us
		opponentPlayer.hooks.onAttack.add(instance, (attack) => {
			if (!attack.isType('primary', 'secondary') || attack.isBacklash) return
			// Only return a backlash attack if the attack would do damage
			if (attack.calculateDamage() <= 0) return

			if (attack.attacker && isTargetingPos(attack, pos)) {
				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					attacker: attack.target,
					target: attack.attacker,
					type: 'effect',
					isBacklash: true,
				}).addDamage(this.id, 40)

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
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		pos.opponentPlayer.hooks.onAttack.remove(instance)
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default ThornsIIIEffectCard
