import {STRENGTHS} from '../const/strengths'
import {HERMIT_CARDS} from '../cards'
import {AttackModel} from '../models/attack-model'
import {WEAKNESS_DAMAGE} from '../const/damage'
import {CardPosModel} from '../models/card-pos-model'
import {EnergyT, RowPos} from '../types/cards'

export function hasEnoughEnergy(energy: Array<EnergyT>, cost: Array<EnergyT>) {
	const remainingEnergy = energy.slice()

	const specificCost = cost.filter((item) => item !== 'any')
	const anyCost = cost.filter((item) => item === 'any')
	const hasEnoughSpecific = specificCost.every((costItem) => {
		// First try find the exact card
		let index = remainingEnergy.findIndex((energyItem) => energyItem === costItem)
		if (index === -1) {
			// Then try find an "any" card
			index = remainingEnergy.findIndex((energyItem) => energyItem === 'any')
			if (index === -1) return
		}
		remainingEnergy.splice(index, 1)
		return true
	})
	if (!hasEnoughSpecific) return false

	// check if remaining energy is enough to cover required "any" cost
	return remainingEnergy.length >= anyCost.length
}

/**
 * Returns true if the attack is targeting the card / row position
 */
export function isTargetingPos(attack: AttackModel, pos: CardPosModel | RowPos): boolean {
	if (!attack.target) return false
	const targetingPlayer = attack.target.player.id === pos.player.id
	const targetingRow = attack.target.rowIndex === pos.rowIndex

	return targetingPlayer && targetingRow
}

// @TODO check this to se if it's ok
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
