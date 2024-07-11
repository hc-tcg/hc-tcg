import StatusEffect, {StatusEffectProps, damageEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {AttackModel} from '../models/attack-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectComponent} from '../types/game-state'
import {executeExtraAttacks} from '../utils/attacks'
import {card, row, slot} from '../filters'

class PoisonStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...damageEffect,
		id: 'poison',
		name: 'Poison',
		description:
			"Poisoned Hermits take an additional 20hp damage at the end of their opponent's turn, until down to 10hp. Can not stack with burn.",
	}

	override onApply(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = instance

		if (pos.cardId) {
			game.battleLog.addEntry(player.id, `$p${pos.cardId.props.name}$ was $ePoisoned$`)
		}

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			let targetSlot = game.state.cards.get(instance.target.entity)?.slot
			if (!targetSlot?.onBoard()) return

			let target = targetSlot.row

			if (!target) return

			const statusEffectAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'statusEffectAttack'),
				attacker: instance.entity,
				target: target?.entity,
				type: 'status-effect',
				log: (values) => `${values.target} took ${values.damage} damage from $bPoison$`,
			})

			if (target.health) {
				if (target.health >= 30) {
					let damage = Math.max(Math.min(target.health - 10, 20), 0)
					statusEffectAttack.addDamage(instance.entity, damage)
				}
			}

			executeExtraAttacks(game, [statusEffectAttack], true)
		})

		player.hooks.afterDefence.add(instance, (attack) => {
			const attackTarget = game.state.rows.get(attack.getTarget())
			if (attackTarget?.health && attackTarget.health > 0) return
			removeStatusEffect(game, pos, instance)
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = instance
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		player.hooks.afterDefence.remove(instance)
	}
}

export default PoisonStatusEffect
