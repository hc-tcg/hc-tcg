import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {isTargetingPos} from '../../../../server/utils/attacks'
import {getCardPos} from '../../../../server/utils/cards'

class ThornsIIEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns_ii',
			name: 'Thorns II',
			rarity: 'rare',
			description:
				'When the hermit this card is attached to takes damage, your opponent takes 30hp damage.\n\nIgnores armor.',
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
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
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		pos.opponentPlayer.hooks.onAttack.remove(instance)
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default ThornsIIEffectCard
