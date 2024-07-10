import StatusEffect, {StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {hasStatusEffect, removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {slot} from '../filters'

class MelodyStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'melody',
		name: "Ollie's Melody",
		description: 'This Hermit heals 10hp every turn.',
		damageEffect: false,
		applyCondition: slot.not(slot.hasStatusEffect('melody')),
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onTurnStart.add(instance, () => {
			const targetPos = game.findSlot(slot.hasInstance(instance.targetInstance))
			if (!targetPos || !targetPos.rowId || !targetPos.rowId.hermitCard) return
			if (targetPos.rowIndex === null) return

			const hermitCard = targetPos.rowId.hermitCard
			if (hermitCard) {
				const maxHealth = Math.max(targetPos.rowId.health, hermitCard.card.props.health)
				targetPos.rowId.health = Math.min(targetPos.rowId.health + 10, maxHealth)
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
		player.hooks.afterDefence.remove(instance)
	}
}

export default MelodyStatusEffect
