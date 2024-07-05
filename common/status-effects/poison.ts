import StatusEffect, {StatusEffectProps, damageEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {RowPos} from '../types/cards'
import {CardPosModel} from '../models/card-pos-model'
import {AttackModel} from '../models/attack-model'
import {getActiveRowPos, removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {executeExtraAttacks} from '../utils/attacks'
import {slot} from '../slot'

class PoisonStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...damageEffect,
		id: 'poison',
		name: 'Poison',
		description:
			"Poisoned Hermits take an additional 20hp damage at the end of their opponent's turn, until down to 10hp. Can not stack with burn.",
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		if (pos.card) {
			game.battleLog.addEntry(player.id, `$p${pos.card.props.name}$ was $ePoisoned$`)
		}

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			const targetPos = game.findSlot(slot.hasInstance(instance.targetInstance))
			if (!targetPos || !targetPos.row || targetPos.rowIndex === null) return
			if (!targetPos.row.hermitCard) return

			const activeRowPos = getActiveRowPos(opponentPlayer)
			const sourceRow: RowPos | null = activeRowPos
				? {
						player: activeRowPos.player,
						rowIndex: activeRowPos.rowIndex,
						row: activeRowPos.row,
				  }
				: null

			const targetRow: RowPos = {
				player: targetPos.player,
				rowIndex: targetPos.rowIndex,
				row: targetPos.row,
			}

			const statusEffectAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'statusEffectAttack'),
				attacker: sourceRow,
				target: targetRow,
				type: 'status-effect',
				log: (values) => `${values.target} took ${values.damage} damage from $bPoison$`,
			})

			if (targetPos.row.health >= 30) {
				statusEffectAttack.addDamage(this.props.id, 20)
			} else if (targetPos.row.health == 20) {
				statusEffectAttack.addDamage(this.props.id, 10)
			}

			executeExtraAttacks(game, [statusEffectAttack], true)
		})

		player.hooks.afterDefence.add(instance, (attack) => {
			const attackTarget = attack.getTarget()
			if (!attackTarget) return
			if (attackTarget.row.hermitCard.instance !== instance.targetInstance.instance) return
			if (attackTarget.row.health > 0) return
			removeStatusEffect(game, pos, instance)
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		player.hooks.afterDefence.remove(instance)
	}
}

export default PoisonStatusEffect
