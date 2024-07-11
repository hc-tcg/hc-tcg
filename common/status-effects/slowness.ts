import StatusEffect, {Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {slot} from '../slot'

class SlownessStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'slowness',
		name: 'Slowness',
		description: 'This Hermit can only use their primary attack.',
		counter: 1,
		counterType: 'turns',
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		if (!instance.counter) instance.counter = this.props.counter

		player.hooks.onTurnStart.add(instance, () => {
			const targetPos = game.findSlot(slot.hasInstance(instance.targetInstance))
			if (!targetPos || targetPos.rowIndex === null) return

			if (player.board.activeRow === targetPos.rowIndex)
				game.addBlockedActions(this.props.id, 'SECONDARY_ATTACK')
		})

		player.hooks.onTurnEnd.add(instance, () => {
			const targetPos = game.findSlot(slot.hasInstance(instance.targetInstance))
			if (!targetPos || targetPos.rowIndex === null) return
			if (!instance.counter) return

			instance.counter--

			if (instance.counter === 0) {
				removeStatusEffect(game, pos, instance)
				return
			}
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
		const {player} = pos
		player.hooks.onTurnStart.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		player.hooks.afterDefence.remove(instance)
	}
}

export default SlownessStatusEffect
