import STRENGTHS from '../const/strengths'
import {HERMIT_CARDS} from '../../common/cards'
import {AttackModel} from '../models/attack-model'
import {WEAKNESS_DAMAGE} from '../routines/turn-actions/attack.js'

/**
 * Returns true if the attack is targeting the card position
 * @param {import('../models/attack-model').AttackModel} attack
 * @param {import('types/cards').CardPos} pos
 * @returns {boolean}
 */
export function isTargetingPos(attack, pos) {
	const targetingPlayer = attack.target.player.id === pos.player.id
	const targetingRow = attack.target.rowIndex === pos.rowIndex

	return targetingPlayer && targetingRow
}

/**
 * @typedef {import('../models/attack-model').AttackModel} Attack
 * @param {Attack} attack
 * @returns {Attack | null}
 */
export function createWeaknessAttack(attack) {
	if (!attack.attacker || !attack.target) return null
	const {target, attacker} = attack
	const attackerCardInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
	const targetCardInfo = HERMIT_CARDS[target.row.hermitCard.cardId]

	const attackId = attackerCardInfo.getInstanceKey(attacker.row.hermitCard.cardInstance, 'weakness')

	const strength = STRENGTHS[attackerCardInfo.hermitType]
	const hasWeakness = target.row.ailments.find((a) => a.id === 'weakness')
	if (!strength.includes(targetCardInfo.hermitType) && !hasWeakness) return null

	/** @type {Attack} **/
	const weaknessAttack = new AttackModel({
		id: attackId,
		attacker,
		target,
		type: 'weakness',
	})

	weaknessAttack.addDamage(WEAKNESS_DAMAGE)

	return weaknessAttack
}
