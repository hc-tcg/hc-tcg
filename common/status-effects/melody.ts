import StatusEffect, {StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {hasStatusEffect, removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {slot} from '../slot'

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
			if (!targetPos || !targetPos.row || !targetPos.row.hermitCard) return
			if (targetPos.rowIndex === null) return

			const hermitCard = targetPos.row.hermitCard
			if (hermitCard) {
				const maxHealth = Math.max(targetPos.row.health, hermitCard.card.props.health)
				targetPos.row.health = Math.min(targetPos.row.health + 10, maxHealth)
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
