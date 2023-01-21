import CARDS from '../../cards'
import STRENGTHS from '../../const/strengths'
import PROTECTION from '../../const/protection'
import DAMAGE from '../../const/damage'

export const ATTACK_TO_ACTION = {
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
	zero: 'ZERO_ATTACK',
}

export const WEAKNESS_DAMAGE = 20

function* attackSaga(turnAction, state) {
	const {currentPlayer, opponentPlayer} = state
	const {type, singleUsePick} = turnAction.payload
	const typeAction = ATTACK_TO_ACTION[type]
	if (!typeAction) {
		console.log('Unknown attack type: ', type)
		return 'INVALID'
	}
	// TODO - send hermitCard from frontend for validation?
	const hermitCard =
		currentPlayer.board.rows[currentPlayer.board.activeRow].hermitCard
	const hermitInfo = CARDS[hermitCard.cardId]

	const singleUseCard = !currentPlayer.board.singleUseCardUsed
		? currentPlayer.board.singleUseCard
		: null
	const singleUseInfo = singleUseCard ? CARDS[singleUseCard.cardId] : null
	const singleUseDamage = singleUseInfo ? DAMAGE[singleUseInfo.id] : null

	if (singleUseDamage) currentPlayer.board.singleUseCardUsed = true
	if (!hermitInfo.hasOwnProperty(type) && !singleUseDamage) {
		console.log('Invalid attack')
		return 'INVALID'
	}

	const targetDamage =
		(hermitInfo[type]?.damage || 0) + (singleUseDamage?.target || 0)

	const targetRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
	const attackerRow = currentPlayer.board.rows[currentPlayer.board.activeRow]
	const afkTargetRow =
		singleUsePick &&
		singleUseDamage?.afkTarget &&
		singleUsePick.rowIndex !== opponentPlayer.board.activeRow
			? opponentPlayer.board.rows[singleUsePick.rowIndex]
			: null
	if (!targetRow || !attackerRow) return 'INVALID'

	const targets = [{row: targetRow, damage: targetDamage}]
	if (afkTargetRow)
		targets.push({row: afkTargetRow, damage: singleUseDamage.afkTarget})

	for (let target of targets) {
		const targetHermitInfo = CARDS[target.row.hermitCard?.cardId]
		if (!targetHermitInfo) continue

		// PROTECTIONS
		const protection = PROTECTION[target.row.effectCard?.cardId]
		let targetProtection = protection?.target || 0
		if (singleUseInfo?.id === 'golden_axe') targetProtection = 0
		// TODO - Move to discard pile
		if (protection?.discard) target.row.effectCard = null

		// STRENGTHS & WEAKNESSES
		const strengths = STRENGTHS[hermitInfo.hermitType]
		const weaknessDamage = strengths.includes(targetHermitInfo.hermitType)
			? WEAKNESS_DAMAGE
			: 0

		const totalDamage = target.damage + weaknessDamage - targetProtection
		target.row.health -= Math.max(totalDamage, 0)
	}

	// I assume that armor/shield is not applied when receiving backlash
	attackerRow.health -= singleUseDamage ? singleUseDamage.self || 0 : 0

	return 'DONE'
}

export default attackSaga
