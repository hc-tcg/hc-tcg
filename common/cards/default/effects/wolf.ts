import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardInstance} from '../../../types/game-state'
import {executeExtraAttacks} from '../../../utils/attacks'
import Card, {Attach, attach} from '../../base/card'

class WolfEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'wolf',
		numericId: 108,
		name: 'Wolf',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		description:
			"Attach to your active Hermit.\nIf any of your Hermits take damage on your opponent's turn, your opponent's active Hermit takes 20hp damage for each Wolf card you have on the game board.",
		attachCondition: slot.every(attach.attachCondition, slot.activeRow),
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		let activated = false

		opponentPlayer.hooks.onTurnStart.add(instance, () => {
			// Allow another activation this turn
			activated = false
		})

		opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
			if (attack.isType('status-effect') || attack.isBacklash) return

			// Only on opponents turn
			if (game.currentPlayerId !== opponentPlayer.id) return

			// Make sure they are targeting this player
			const target = attack.getTarget()
			if (!target || target.player.id !== player.id) return

			// Make sure the attack is doing some damage
			if (attack.calculateDamage() <= 0) return

			if (activated) return
			activated = true
			if (!pos.rowId || !pos.rowId.hermitCard || pos.rowIndex === null) return

			// Add a backlash attack, targeting the opponent's active hermit.
			// Note that the opponent active row could be null, but then the attack will just do nothing.
			const opponentActiveRow = getActiveRowPos(opponentPlayer)

			const backlashAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'backlash'),
				attacker: {row: pos.rowId, player: pos.player, rowIndex: pos.rowIndex},
				target: opponentActiveRow,
				type: 'effect',
				isBacklash: true,
				log: (values) => `${values.target} took ${values.damage} damage from $eWolf$`,
			}).addDamage(this.props.id, 20)

			executeExtraAttacks(game, [backlashAttack])
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		// Delete hooks and custom
		opponentPlayer.hooks.onTurnStart.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
	}
}

export default WolfEffectCard
