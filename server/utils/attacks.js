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
