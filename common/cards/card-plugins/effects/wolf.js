import {AttackModel} from '../../../../server/models/attack-model'
import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {getCardPos} from '../../../../server/utils/cards'
import {isTargetingPos} from '../../../../server/utils/attacks'
import {getActiveRowPos} from '../../../../server/utils'

class WolfEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wolf',
			name: 'Wolf',
			rarity: 'rare',
			description:
				"For every hermit attacked on your opponent's turn, your opponent's active hermit takes 10hp damage.",
		})
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const attackedRows = this.getInstanceKey(instance, 'attackedRows')

		opponentPlayer.hooks.onTurnStart[instance] = () => {
			// Clear the rows that were attacked
			player.custom[attackedRows] = []
		}

		// Only on opponents turn
		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (attack.isType('ailment') || attack.isBacklash) return

			// Make sure they are targeting this player
			if (!attack.target || attack.target.player.id !== player.id) return

			// Make sure our row is active
			const activeRow = getActiveRowPos(player)
			if (!activeRow || activeRow.rowIndex !== pos.rowIndex) return

			if (player.custom[attackedRows].includes(attack.target.rowIndex)) return
			player.custom[attackedRows].push(attack.target.rowIndex)

			// Add a backlash attack, targeting the opponent's active hermit.
			// Note that the opponent active row could be null, but then the attack will just do nothing.
			const opponentActiveRow = getActiveRowPos(opponentPlayer)

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: activeRow,
				target: opponentActiveRow,
				type: 'effect',
				isBacklash: true,
			}).addDamage(this.id, 10)

			attack.addNewAttack(backlashAttack)
		}
	}

	/**
	 *
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		// Delete hooks and custom
		delete player.custom[this.getInstanceKey(instance, 'attackedRows')]
		delete opponentPlayer.hooks.onTurnStart[instance]
		delete opponentPlayer.hooks.onAttack[instance]
	}
}

export default WolfEffectCard
