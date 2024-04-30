import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRowPos, getRowPos} from '../../../utils/board'
import EffectCard from '../../base/effect-card'

class WolfEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'wolf',
			numericId: 108,
			name: 'Wolf',
			rarity: 'rare',
			description:
				"Attach to your active Hermit.\n\nIf any of your Hermits are attacked on your opponent's turn, your opponent's active Hermit takes 20hp damage. Still activates while attached to an AFK Hermit.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)
		const {player} = pos

		// wolf addition - hermit must also be active to attach
		if (!(player.board.activeRow === pos.rowIndex)) result.push('INVALID_SLOT')

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const activated = this.getInstanceKey(instance, 'activated')

		opponentPlayer.hooks.onTurnStart.add(instance, () => {
			// Allow another activation this turn
			player.custom[activated] = false
		})

		// Only on opponent's turn
		opponentPlayer.hooks.onAttack.add(instance, (attack) => {
			if (attack.isType('status-effect') || attack.isBacklash) return
			if (attack.getDamage() * attack.getDamageMultiplier() === 0) return

			// Make sure they are targeting this player
			const target = attack.getTarget()
			if (!target || target.player.id !== player.id) return

			if (player.custom[activated]) return
			player.custom[activated] = true

			// Add a backlash attack, targeting the opponent's active hermit.
			// Note that the opponent active row could be null, but then the attack will just do nothing.
			const opponentActiveRow = getActiveRowPos(opponentPlayer)

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: getRowPos(pos),
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
		delete player.custom[this.getInstanceKey(instance, 'activated')]
		opponentPlayer.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.onAttack.remove(instance)
	}
}

export default WolfEffectCard
