import StatusEffect, {StatusEffectProps, damageEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {RowPos} from '../types/cards'
import {CardPosModel} from '../models/card-pos-model'
import {AttackModel} from '../models/attack-model'
import {getActiveRowPos, removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {executeExtraAttacks} from '../utils/attacks'
import {slot} from '../filters'

class FireStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...damageEffect,
		id: 'fire',
		name: 'Burn',
		description:
			"Burned Hermits take an additional 20hp damage at the end of their opponent's turn, until knocked out. Can not stack with poison.",
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		if (pos.cardId) {
			game.battleLog.addEntry(player.id, `$p${pos.cardId.props.name}$ was $eBurned$`)
		}

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			const targetPos = game.findSlot(slot.hasInstance(instance.targetInstance))
			if (!targetPos || !targetPos.rowId || targetPos.rowIndex === null) return
			if (!targetPos.rowId.hermitCard) return

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
				row: targetPos.rowId,
			}

			const statusEffectAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'statusEffectAttack'),
				attacker: sourceRow,
				target: targetRow,
				type: 'status-effect',
				log: (values) => `${values.target} took ${values.damage} damage from $bBurn$`,
			})
			statusEffectAttack.addDamage(this.props.id, 20)

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

export default FireStatusEffect
