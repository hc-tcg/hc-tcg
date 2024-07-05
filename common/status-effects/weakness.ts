import StatusEffect, {Counter, StatusEffectProps} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {getActiveRow, removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'

class WeaknessStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		id: 'weakness',
		name: 'Weakness',
		description: "This Hermit is weak to the opponent's active Hermit's type.",
		counter: 3,
		counterType: 'turns',
		damageEffect: false,
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player, opponentPlayer} = pos

		if (!statusEffectInfo.counter) statusEffectInfo.counter = this.props.counter

		if (pos.card) {
			game.battleLog.addEntry(player.id, `$p${pos.card.props.name}$ was inflicted with $eWeakness$`)
		}

		player.hooks.onTurnStart.add(statusEffectInfo, () => {
			if (!statusEffectInfo.counter) return
			statusEffectInfo.counter--

			if (statusEffectInfo.counter === 0) removeStatusEffect(game, pos, statusEffectInfo)
		})

		opponentPlayer.hooks.onAttack.add(statusEffectInfo, (attack) => {
			const targetPos = getCardPos(game, statusEffectInfo.targetInstance)

			if (!targetPos) return

			if (!isTargetingPos(attack, targetPos) || attack.createWeakness === 'never') {
				return
			}

			attack.createWeakness = 'always'
		})

		player.hooks.onAttack.add(statusEffectInfo, (attack) => {
			const targetPos = getCardPos(game, statusEffectInfo.targetInstance)

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

		player.hooks.afterDefence.add(statusEffectInfo, (attack) => {
			const attackTarget = attack.getTarget()
			if (!attackTarget) return
			if (attackTarget.row.hermitCard.instance !== statusEffectInfo.targetInstance.instance) return
			if (attackTarget.row.health > 0) return
			removeStatusEffect(game, pos, statusEffectInfo)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.onAttack.remove(statusEffectInfo)
		opponentPlayer.hooks.onAttack.remove(statusEffectInfo)
		player.hooks.onTurnStart.remove(statusEffectInfo)
		player.hooks.afterDefence.remove(statusEffectInfo)
	}
}

export default WeaknessStatusEffect
