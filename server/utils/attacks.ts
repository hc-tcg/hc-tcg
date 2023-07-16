import STRENGTHS from '../../common/const/strengths'
import {HERMIT_CARDS} from '../../common/cards'
import {AttackModel} from '../models/attack-model'
import {WEAKNESS_DAMAGE} from '../routines/turn-actions/attack.js'
import {CardPos} from '../../common/types/cards'

/**
 * Returns true if the attack is targeting the card position
 * @param {import('../models/attack-model').AttackModel} attack
 * @param {import('types/cards').CardPos} pos
 * @returns {boolean}
 */
export function isTargetingPos(attack: AttackModel, pos: CardPos): boolean {
	if (!attack.target) return false
	const targetingPlayer = attack.target.player.id === pos.player.id
	const targetingRow = attack.target.rowIndex === pos.rowIndex

	return targetingPlayer && targetingRow
}

export function createWeaknessAttack(attack: AttackModel): AttackModel | null {
	if (!attack.attacker || !attack.target) return null
	const {target, attacker} = attack
	const attackerCardInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
	const targetCardInfo = HERMIT_CARDS[target.row.hermitCard.cardId]
	if (!attackerCardInfo || !targetCardInfo) return null

	const attackId = attackerCardInfo.getInstanceKey(attacker.row.hermitCard.cardInstance, 'weakness')

	const strength = STRENGTHS[attackerCardInfo.hermitType]
	const hasWeakness = target.row.ailments.find((a) => a.id === 'weakness')
	if (!strength.includes(targetCardInfo.hermitType) && !hasWeakness) return null

	const weaknessAttack = new AttackModel({
		id: attackId,
		attacker,
		target,
		type: 'weakness',
	})

	weaknessAttack.addDamage(attackerCardInfo.id, WEAKNESS_DAMAGE)

	return weaknessAttack
}
