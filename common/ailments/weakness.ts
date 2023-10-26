import Ailment from "./ailment"
import { GameModel } from "../models/game-model"
import { HERMIT_CARDS } from "../cards"
import { CardPosModel, getCardPos } from "../models/card-pos-model"
import { removeAilment } from "../utils/board"
import { AttackModel } from "../models/attack-model"
import { AilmentT } from "../types/game-state"
import { isTargetingPos } from "../utils/attacks"
import { STRENGTHS } from "../const/strengths"
import { WEAKNESS_DAMAGE } from "../const/damage"

class WeaknessAilment extends Ailment{
    constructor() {
		super({
			id: 'weakness',
			name: 'Weakness',
			duration: 3,
			damageEffect: false,
		})
	}

	override onApply(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		game.state.ailments.push(ailmentInfo)
		const {player, opponentPlayer} = pos

		if (!ailmentInfo.duration) ailmentInfo.duration = this.duration

		player.hooks.onTurnStart.add(ailmentInfo.ailmentInstance, () => {
			if (!ailmentInfo.duration) return
			ailmentInfo.duration --

			if (ailmentInfo.duration === 0) removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})

		opponentPlayer.hooks.beforeAttack.add(ailmentInfo.ailmentInstance, (attack) => {
			const targetPos = getCardPos(game, ailmentInfo.targetInstance)
			if (!targetPos) return
			
			if (!isTargetingPos(attack, targetPos) || attack.isType('ailment') || attack.isType('weakness')) return

			if (!attack.attacker || !attack.target) return
			const {target, attacker} = attack
			const attackerCardInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
			const targetCardInfo = HERMIT_CARDS[target.row.hermitCard.cardId]
			if (!attackerCardInfo || !targetCardInfo) return
		
			const attackId = attackerCardInfo.getInstanceKey(attacker.row.hermitCard.cardInstance, 'weakness')
		
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

		player.hooks.onHermitDeath.add(ailmentInfo.ailmentInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != ailmentInfo.targetInstance) return
			removeAilment(game, pos, ailmentInfo.ailmentInstance)
		})
	}

	override onRemoval(game: GameModel, ailmentInfo: AilmentT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.beforeAttack.remove(ailmentInfo.ailmentInstance)
		player.hooks.onTurnStart.remove(ailmentInfo.ailmentInstance)
		player.hooks.onHermitDeath.remove(ailmentInfo.ailmentInstance)
	}
}

export default WeaknessAilment