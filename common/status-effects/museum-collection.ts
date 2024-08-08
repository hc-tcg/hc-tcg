import {CardComponent} from '../components'
import {Counter, statusEffect} from './status-effect'

const MuseumCollectionEffect: Counter<CardComponent> = {
	...statusEffect,
	icon: 'museum-collection',
	name: 'Museum Collection Size',
	description:
		"Number of cards you've played this turn. Each card adds 20 damage to Biffa's secondary attack.",
	counter: 0,
	counterType: 'number',

	// override onApply(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
	// 	const {player} = component
	// 	let oldHandSize = player.hand.length

	// 	player.hooks.onAttach.add(instance, (cardInstance) => {
	// 		if (player.hand.length === oldHandSize) return
	// 		const instanceLocation = game.findSlot(slot.hasInstance(cardInstance))
	// 		if (instance.counter === null) return
	// 		oldHandSize = player.hand.length
	// 		if (instanceLocation?.type === 'single_use') return
	// 		instance.counter++
	// 	})

	// 	player.hooks.onApply.add(instance, () => {
	// 		if (instance.counter === null) return
	// 		oldHandSize = player.hand.length
	// 		instance.counter++
	// 	})

	// 	player.hooks.onAttack.add(instance, (attack) => {
	// 		const activeRow = player.board.activeRow
	// 		if (activeRow === null) return
	// 		const targetHermit = player.board.rows[activeRow].hermitCard
	// 		if (!targetHermit) return
	// 		if (
	// 			attack.getAttacker()?.row.hermitCard.instance !== instance.target.entity ||
	// 			attack.type !== 'secondary'
	// 		)
	// 			return
	// 		if (instance.counter === null) return

	// 		player.hooks.onApply.remove(instance)
	// 		player.hooks.onApply.add(instance, () => {
	// 			if (instance.counter == null) return
	// 			instance.counter++

	// 			const additionalAttack = new AttackModel({
	// 				id: this.getInstanceKey(instance, 'additionalAttack'),
	// 				attacker: attack.getAttacker(),
	// 				target: attack.getTarget(),
	// 				type: 'secondary',
	// 			})
	// 			additionalAttack.addDamage(this.props.id, 20)

	// 			player.hooks.onApply.remove(instance)

	// 			executeAttacks(game, [additionalAttack], true)
	// 		})

	// 		attack.addDamage(this.props.id, 20 * instance.counter)
	// 	})

	// 	player.hooks.onTurnEnd.add(instance, () => {
	// 		removeStatusEffect(game, pos, instance)
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
	// 	// Remove hooks
	// 	player.hooks.onApply.remove(instance)
	// 	player.hooks.onAttach.remove(instance)
	// 	player.hooks.onAttack.remove(instance)
	// 	player.hooks.onTurnEnd.remove(instance)
	// 	player.hooks.afterDefence.remove(instance)
	// }
}

export default MuseumCollectionEffect
