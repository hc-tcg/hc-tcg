import StatusEffect, {Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {executeAttacks} from '../utils/attacks'
import {AttackModel} from '../models/attack-model'
import {slot} from '../slot'

class MuseumCollectionStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'museum-collection',
		name: 'Museum Collection Size',
		description:
			"Number of cards you've played this turn. Each card adds 20 damage to Biffa's secondary attack.",
		counter: 0,
		counterType: 'number',
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos
		let oldHandSize = player.hand.length

		player.hooks.onAttach.add(statusEffectInfo, (instance) => {
			if (player.hand.length === oldHandSize) return
			const instanceLocation = game.findSlot(slot.hasInstance(instance))
			if (statusEffectInfo.counter === null) return
			oldHandSize = player.hand.length
			if (instanceLocation?.type === 'single_use') return
			statusEffectInfo.counter++
		})

		player.hooks.onApply.add(statusEffectInfo, () => {
			if (statusEffectInfo.counter === null) return
			oldHandSize = player.hand.length
			statusEffectInfo.counter++
		})

		player.hooks.onAttack.add(statusEffectInfo, (attack) => {
			const activeRow = player.board.activeRow
			if (activeRow === null) return
			const targetHermit = player.board.rows[activeRow].hermitCard
			if (!targetHermit) return
			if (
				attack.getAttacker()?.row.hermitCard.instance !==
					statusEffectInfo.targetInstance.instance ||
				attack.type !== 'secondary'
			)
				return
			if (statusEffectInfo.counter === null) return

			player.hooks.onApply.remove(statusEffectInfo)
			player.hooks.onApply.add(statusEffectInfo, () => {
				if (statusEffectInfo.counter == null) return
				statusEffectInfo.counter++

				const additionalAttack = new AttackModel({
					id: this.getInstanceKey(statusEffectInfo, 'additionalAttack'),
					attacker: attack.getAttacker(),
					target: attack.getTarget(),
					type: 'secondary',
				})
				additionalAttack.addDamage(this.props.id, 20)

				player.hooks.onApply.remove(statusEffectInfo)

				executeAttacks(game, [additionalAttack], true)
			})

			attack.addDamage(this.props.id, 20 * statusEffectInfo.counter)
		})

		player.hooks.onTurnEnd.add(statusEffectInfo, () => {
			removeStatusEffect(game, pos, statusEffectInfo)
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
		// Remove hooks
		player.hooks.onApply.remove(statusEffectInfo)
		player.hooks.onAttach.remove(statusEffectInfo)
		player.hooks.onAttack.remove(statusEffectInfo)
		player.hooks.onTurnEnd.remove(statusEffectInfo)
		player.hooks.afterDefence.remove(statusEffectInfo)
	}
}

export default MuseumCollectionStatusEffect
