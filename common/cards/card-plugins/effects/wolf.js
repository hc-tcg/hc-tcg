import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {getCardPos} from '../../../../server/utils/cards'

class WolfEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wolf',
			name: 'Wolf',
			rarity: 'rare',
			description:
				'Opponent takes 20hp damage after their attack.\nIgnores armour.',
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		pos.otherPlayer.hooks.onAttack[instance] = (attack, pickedCards) => {
			if (attack.attacker && pos.player.board.activeRow === pos.rowIndex) {
				const backlashAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'backlash'),
					target: attack.attacker,
					type: 'backlash',
				})
				backlashAttack.addDamage(20)
				backlashAttack.shouldIgnoreCards.push((instance) => {
					const pos = getCardPos(game, instance)
					if (!pos) return false
					if (!pos.row?.effectCard) return false

					return [
						'diamond_armor',
						'gold_armor',
						'iron_armor',
						'netherite_armor',
					].includes(pos.row?.effectCard?.cardId)
				})

				attack.addNewAttack(backlashAttack)
			}

			return attack
		}
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		delete pos.otherPlayer.hooks.onAttack[instance]
	}
}

export default WolfEffectCard
