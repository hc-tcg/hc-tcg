import {CardComponent} from '../components'
import {StatusEffect, statusEffect} from './status-effect'

const MelodyEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	icon: 'melody',
	name: "Ollie's Melody",
	description: 'This Hermit heals 10hp every turn.',
	applyCondition: (_game, card) =>
		card instanceof CardComponent && !card.getStatusEffect(MelodyEffect),

	// override onApply(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
	// 	const {player} = component

	// 	player.hooks.onTurnStart.add(instance, () => {
	// 		const targetPos = game.findSlot(query.slot.hasInstance(instance.target))
	// 		if (!targetPos || !targetPos.rowId || !targetPos.rowId.hermitCard) return
	// 		if (targetPos.rowIndex === null) return

	// 		const hermitCard = targetPos.rowId.hermitCard
	// 		if (hermitCard) {
	// 			const maxHealth = Math.max(targetPos.rowId.health, hermitCard.card.props.health)
	// 			targetPos.rowId.health = Math.min(targetPos.rowId.health + 10, maxHealth)
	// 		}
	// 	})

	// 	player.hooks.afterDefence.add(instance, (attack) => {
	// 		const attackTarget = attack.getTarget()
	// 		if (!attackTarget) return
	// 		if (attackTarget.row.hermitCard.instance !== instance.target.entity) return
	// 		if (attackTarget.row.health > 0) return
	// 		removeStatusEffect(game, pos, instance)
	// 	})
	// }

	// override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
	// 	const {player} = component

	// 	player.hooks.onTurnStart.remove(instance)
	// 	player.hooks.afterDefence.remove(instance)
	// }
}

export default MelodyEffect
