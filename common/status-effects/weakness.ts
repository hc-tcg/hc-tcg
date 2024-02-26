import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {HERMIT_CARDS} from '../cards'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {AttackModel} from '../models/attack-model'
import {StatusEffectT} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'
import {STRENGTHS} from '../const/strengths'
import {WEAKNESS_DAMAGE} from '../const/damage'

class WeaknessStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'weakness',
			name: 'Weakness',
			description: "This Hermit is weak to the opponent's active Hermit's type.",
			duration: 3,
			counter: false,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player, opponentPlayer} = pos

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		player.hooks.onTurnStart.add(statusEffectInfo.statusEffectInstance, () => {
			if (!statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0)
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})

		opponentPlayer.hooks.beforeAttack.add(statusEffectInfo.statusEffectInstance, (attack) => {
			const targetPos = getCardPos(game, statusEffectInfo.targetInstance)
			if (!targetPos) return

			if (
				!isTargetingPos(attack, targetPos) ||
				attack.isType('status-effect', 'weakness', 'effect')
			) {
				return
			}

			if (!attack.attacker || !attack.target) return
			const {target, attacker} = attack
			const attackerCardInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
			const targetCardInfo = HERMIT_CARDS[target.row.hermitCard.cardId]
			if (!attackerCardInfo || !targetCardInfo) return

			const attackId = attackerCardInfo.getInstanceKey(
				attacker.row.hermitCard.cardInstance,
				'weakness'
			)

			const strength = STRENGTHS[attackerCardInfo.hermitType]
			if (strength.includes(targetCardInfo.hermitType)) return

			const weaknessAttack = new AttackModel({
				id: attackId,
				attacker,
				target,
				type: 'weakness',
			})

			weaknessAttack.addDamage(attackerCardInfo.id, WEAKNESS_DAMAGE)

			attack.addNewAttack(weaknessAttack)
		})

		player.hooks.onHermitDeath.add(statusEffectInfo.statusEffectInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != statusEffectInfo.targetInstance) return
			removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.beforeAttack.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default WeaknessStatusEffect
