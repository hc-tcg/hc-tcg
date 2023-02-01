import CARDS from '../../cards'
import STRENGTHS from '../../const/strengths'
import {applySingleUse, discardCard} from '../../utils'

export const ATTACK_TO_ACTION = {
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
	zero: 'ZERO_ATTACK',
}

export const WEAKNESS_DAMAGE = 20

function* attackSaga(game, turnAction, derivedState) {
	const {
		currentPlayer,
		opponentPlayer,
		pickedCardsInfo,
		playerActiveRow,
		opponentActiveRow,
		playerHermitInfo,
	} = derivedState
	const {type} = turnAction.payload
	const typeAction = ATTACK_TO_ACTION[type]
	if (!typeAction) {
		console.log('Unknown attack type: ', type)
		return 'INVALID'
	}
	// TODO - send hermitCard from frontend for validation?

	const attackerActiveRow = playerActiveRow

	const singleUseCard = !currentPlayer.board.singleUseCardUsed
		? currentPlayer.board.singleUseCard
		: null

	const suPickedCards = pickedCardsInfo[singleUseCard?.cardId] || []

	const afkTargetRow =
		suPickedCards.length === 1 &&
		suPickedCards[0].playerId == opponentPlayer.id &&
		suPickedCards[0].rowIndex !== opponentPlayer.board.activeRow
			? suPickedCards[0].row
			: null

	if (!attackerActiveRow) return 'INVALID'

	const attackerHermitCard = attackerActiveRow.hermitCard
	const attackerHermitInfo = CARDS[attackerHermitCard.cardId]
	if (!attackerHermitInfo) return 'INVALID'
	const strengths = STRENGTHS[attackerHermitInfo.hermitType]

	const makeTarget = (row) => ({
		row,
		effectCardId: row.effectCard?.cardId,
		isActive: row === opponentActiveRow,
		damage: 0,
		protection: 0,
		recovery: [], // Array<{amount: number, discardEffect: boolean}>
		ignoreProtection: false,
		backlash: 0,
		multiplier: 1,
		invalid: false,
	})
	const targets = []
	if (opponentActiveRow?.hermitCard) {
		targets.push(makeTarget(opponentActiveRow))
	}
	if (afkTargetRow?.hermitCard) {
		targets.push(makeTarget(afkTargetRow))
	}

	if (!targets.length) return 'INVALID'

	const processedTargets = []
	for (let target of targets) {
		const result = game.hooks.attack.call(target, turnAction, {
			...derivedState,
			typeAction,
			attackerActiveRow,
			attackerHermitCard,
			attackerHermitInfo,
		})
		if (result.invalid) return 'INVALID'

		// e.g. when hypno attacks the same afk hermit with his ability and a bow
		const sameTarget = processedTargets.find((pt) => pt.row === target.row)
		if (sameTarget) {
			sameTarget.damage += target.damage
		} else {
			processedTargets.push(target)
		}
	}

	for (let target of processedTargets) {
		const result = game.hooks.attack.call(target, turnAction, {
			...derivedState,
			typeAction,
			attackerActiveRow,
			attackerHermitCard,
			attackerHermitInfo,
		})

		const targetHermitInfo = CARDS[target.row.hermitCard.cardId]
		const hermitAttack = target.isActive
			? attackerHermitInfo[type]?.damage || 0
			: 0
		const health = target.row.health
		const maxHealth = targetHermitInfo.health
		const protection = target.ignoreProtection ? 0 : target.protection
		const weaknessDamage = strengths.includes(targetHermitInfo.hermitType)
			? WEAKNESS_DAMAGE
			: 0
		const totalDamage =
			Math.max(hermitAttack + target.damage + weaknessDamage - protection, 0) *
			target.multiplier
		target.row.health = Math.min(maxHealth, health - totalDamage)

		target.recovery.sort((a, b) => b.amount - a.amount)

		const isDead = target.row.health < 0
		const recovery = target.recovery[0]
		const ignoreRecovery = target.ignoreProtection && recovery?.discardEffect
		if (isDead && !ignoreRecovery && recovery) {
			target.row.health = recovery.amount
			target.row.ailments = []
			if (recovery.discardEffect) {
				discardCard(game, target.row.effectCard)
			}
		}

		attackerActiveRow.health -= target.backlash
	}

	const anyDamage = targets.some((target) => target.damage)
	if (anyDamage) applySingleUse(currentPlayer)

	return 'DONE'
}

export default attackSaga
