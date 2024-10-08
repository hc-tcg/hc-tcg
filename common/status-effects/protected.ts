import {CardComponent} from '../components'
import {StatusEffect, statusEffect} from './status-effect'

const ProtectedEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	id: 'protected',
	icon: 'protected',
	name: "Sheriff's Protection",
	description: 'This Hermit does not take damage on their first active turn.',

	// override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent, ) {
	// 	const {player} = component

	// 	let canBlock = true

	// 	player.hooks.onTurnEnd.add(effect, () => {
	// 		if (player.board.activeRow === target.rowIndex) {
	// 			canBlock = false
	// 		}
	// 	})

	// 	player.hooks.onTurnStart.add(effect, () => {
	// 		if (!canBlock) {
	// 			removeStatusEffect(game, target, effect)
	// 		}
	// 	})

	// 	player.hooks.onDefence.add(effect, (attack) => {
	// 		const targetPos = getCardPos(game, effect.target)
	// 		if (!targetPos) return
	// 		// Only block if just became active
	// 		if (!canBlock) return

	// 		// Only block damage when we are active
	// 		const isActive = player.board.activeRow === target.rowIndex
	// 		if (!isActive || !isTargeting(attack, targetPos)) return
	// 		// Do not block backlash attacks
	// 		if (attack.isBacklash) return

	// 		if (attack.getDamage() > 0) {
	// 			// Block all damage
	// 			attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
	// 		}
	// 	})

	// 	player.hooks.afterDefence.add(effect, (attack) => {
	// 		const attackTarget = attack.getTarget()
	// 		if (!attackTarget) return
	// 		if (attackTarget.row.hermitCard.instance !== effect.target.entity) return
	// 		if (attackTarget.row.health > 0) return
	// 		removeStatusEffect(game, target, effect)
	// 	})
	// }

	// override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
	// 	const {player} = component

	// 	player.hooks.onDefence.remove(instance)
	// 	player.hooks.onTurnEnd.remove(instance)
	// 	player.hooks.onTurnStart.remove(instance)
	// 	player.hooks.onDefence.remove(instance)
	// }
}

export default ProtectedEffect
