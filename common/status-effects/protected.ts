import StatusEffect, {StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectComponent} from '../types/game-state'
import {isTargeting} from '../utils/attacks'

class ProtectedStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'protected',
		name: "Sheriff's Protection",
		description: 'This Hermit does not take damage on their first active turn.',
	}

	override onApply(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player} = component

		let canBlock = true

		player.hooks.onTurnEnd.add(instance, () => {
			if (player.board.activeRow === pos.rowIndex) {
				canBlock = false
			}
		})

		player.hooks.onTurnStart.add(instance, () => {
			if (!canBlock) {
				removeStatusEffect(game, pos, instance)
			}
		})

		player.hooks.onDefence.add(instance, (attack) => {
			const targetPos = getCardPos(game, instance.target)
			if (!targetPos) return
			// Only block if just became active
			if (!canBlock) return

			// Only block damage when we are active
			const isActive = player.board.activeRow === pos.rowIndex
			if (!isActive || !isTargeting(attack, targetPos)) return
			// Do not block backlash attacks
			if (attack.isBacklash) return

			if (attack.getDamage() > 0) {
				// Block all damage
				attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
			}
		})

		player.hooks.afterDefence.add(instance, (attack) => {
			const attackTarget = attack.getTarget()
			if (!attackTarget) return
			if (attackTarget.row.hermitCard.instance !== instance.target.entity) return
			if (attackTarget.row.health > 0) return
			removeStatusEffect(game, pos, instance)
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player} = component

		player.hooks.onDefence.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		player.hooks.onDefence.remove(instance)
	}
}

export default ProtectedStatusEffect
