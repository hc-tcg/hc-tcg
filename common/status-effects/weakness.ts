import StatusEffect, {Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {getActiveRow, removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'

class WeaknessStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'weakness',
		name: 'Weakness',
		description: "This Hermit is weak to the opponent's active Hermit's type.",
		counter: 3,
		counterType: 'turns',
	}

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		if (!instance.counter) instance.counter = this.props.counter

		if (pos.card) {
			game.battleLog.addEntry(player.id, `$p${pos.card.props.name}$ was inflicted with $eWeakness$`)
		}

		player.hooks.onTurnStart.add(instance, () => {
			if (!instance.counter) return
			instance.counter--

			if (instance.counter === 0) removeStatusEffect(game, pos, instance)
		})

		opponentPlayer.hooks.onAttack.add(instance, (attack) => {
			const targetPos = getCardPos(game, instance.targetInstance)

			if (!targetPos) return

			if (!isTargetingPos(attack, targetPos) || attack.createWeakness === 'never') {
				return
			}

			attack.createWeakness = 'always'
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const targetPos = getCardPos(game, instance.targetInstance)

			if (!targetPos) return

			if (!isTargetingPos(attack, targetPos) || attack.createWeakness === 'never') {
				return
			}

			const attacker = attack.getAttacker()
			const opponentActiveHermit = getActiveRow(opponentPlayer)

			if (
				!attacker ||
				!opponentActiveHermit ||
				!attacker.row.hermitCard.card.isHermit() ||
				!opponentActiveHermit.hermitCard.card.isHermit()
			)
				return

			const attackerType = attacker.row.hermitCard.card.props.type
			const opponentType = opponentActiveHermit.hermitCard.card.props.type

			if (attackerType !== opponentType) return

			attack.createWeakness = 'always'
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
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.onAttack.remove(instance)
		player.hooks.onTurnStart.remove(instance)
		player.hooks.afterDefence.remove(instance)
	}
}

export default WeaknessStatusEffect
