import StatusEffect, {StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'

class ProtectedStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'protected',
		name: "Sheriff's Protection",
		description: 'This Hermit does not take damage on their first active turn.',
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		let canBlock = true

		player.hooks.onTurnEnd.add(statusEffectInfo, () => {
			if (player.board.activeRow === pos.rowIndex) {
				canBlock = false
			}
		})

		player.hooks.onTurnStart.add(statusEffectInfo, () => {
			if (!canBlock) {
				removeStatusEffect(game, pos, statusEffectInfo)
			}
		})

		player.hooks.onDefence.add(statusEffectInfo, (attack) => {
			const targetPos = getCardPos(game, statusEffectInfo.targetInstance)
			if (!targetPos) return
			// Only block if just became active
			if (!canBlock) return

			// Only block damage when we are active
			const isActive = player.board.activeRow === pos.rowIndex
			if (!isActive || !isTargetingPos(attack, targetPos)) return
			// Do not block backlash attacks
			if (attack.isBacklash) return

			if (attack.getDamage() > 0) {
				// Block all damage
				attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
			}
		})

		player.hooks.afterDefence.add(statusEffectInfo, (attack) => {
			const attackTarget = attack.getTarget()
			if (!attackTarget) return
			if (attackTarget.row.hermitCard.instance !== statusEffectInfo.targetInstance.instance) return
			if (attackTarget.row.health > 0) return
			removeStatusEffect(game, pos, statusEffectInfo)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onDefence.remove(statusEffectInfo)
		player.hooks.onTurnEnd.remove(statusEffectInfo)
		player.hooks.onTurnStart.remove(statusEffectInfo)
		player.hooks.onDefence.remove(statusEffectInfo)
	}
}

export default ProtectedStatusEffect
