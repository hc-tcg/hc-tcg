import {AttackModel} from '../../models/attack-model'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {getActiveRowPos} from '../../utils/board'
import EffectCard from '../base/effect-card'

class WolfEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wolf',
			numeric_id: 108,
			name: 'Wolf',
			rarity: 'rare',
			description:
				"For every Hermit attacked on your opponent's turn, your opponent's active Hermit takes 20hp damage.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const attackedRows = this.getInstanceKey(instance, 'attackedRows')

		opponentPlayer.hooks.onTurnStart.add(instance, () => {
			// Clear the rows that were attacked
			player.custom[attackedRows] = []
		})

		// Only on opponents turn
		opponentPlayer.hooks.onAttack.add(instance, (attack) => {
			if (attack.isType('ailment') || attack.isBacklash) return

			// Make sure they are targeting this player
			if (!attack.target || attack.target.player.id !== player.id) return

			// Make sure our row is active
			const activeRow = getActiveRowPos(player)
			if (!activeRow || activeRow.rowIndex !== pos.rowIndex) return

			if (!player.custom[attackedRows]) player.custom[attackedRows] = []
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
			}).addDamage(this.id, 20)

			attack.addNewAttack(backlashAttack)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		// Delete hooks and custom
		delete player.custom[this.getInstanceKey(instance, 'attackedRows')]
		opponentPlayer.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.onAttack.remove(instance)
	}
}

export default WolfEffectCard
