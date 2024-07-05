import StatusEffect, {StatusEffectProps, Counter, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {slot} from '../slot'

class SleepingStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'sleeping',
		name: 'Sleep',
		description:
			'While your Hermit is sleeping, you can not attack or make your active Hermit go AFK. If sleeping Hermit is made AFK by your opponent, they wake up.',
		counter: 3,
		counterType: 'turns',
		applyCondition: slot.every(slot.hermitSlot, slot.not(slot.empty)),
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player, card, row, rowIndex} = pos

		if (!card || !row?.hermitCard || rowIndex === null || !card.card.isHealth()) return

		game.addBlockedActions(
			this.props.id,
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'CHANGE_ACTIVE_HERMIT'
		)

		row.health = card.card.props.health

		game.battleLog.addEntry(
			player.id,
			`$p${card.props.name}$ went to $eSleep$ and restored $gfull health$`
		)

		player.hooks.onTurnStart.add(instance, () => {
			const targetPos = game.findSlot(slot.hasInstance(instance.targetInstance))
			if (!targetPos) return
			if (instance.counter !== null) instance.counter--

			if (instance.counter === 0 || player.board.activeRow !== targetPos.rowIndex) {
				removeStatusEffect(game, pos, instance)
				return
			}

			if (player.board.activeRow === targetPos.rowIndex)
				game.addBlockedActions(
					this.props.id,
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'CHANGE_ACTIVE_HERMIT'
				)
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
		player.hooks.afterDefence.remove(instance)
	}
}

export default SleepingStatusEffect
