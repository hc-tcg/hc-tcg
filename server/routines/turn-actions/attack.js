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
		suPickedCards[0].playerId === opponentPlayer.id &&
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
		attackerRow: playerActiveRow,
		effectCardId: row.effectCard?.cardId,
		attackerEffectCardId: playerActiveRow.effectCard?.cardId,
		isActive: row === opponentActiveRow,
		extraEffectDamage: 0,
		extraHermitDamage: 0,
		protection: 0,
		attackerProtection: 0,
		recovery: [], // Array<{amount: number, discardEffect: boolean}>
		ignoreEffects: false,
		reverseDamage: false,
		backlash: 0,
		counter: 0,
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
			sameTarget.extraEffectDamage += target.extraEffectDamage
			sameTarget.extraHermitDamage += target.extraHermitDamage
		} else {
			processedTargets.push(target)
		}
	}

	for (let target of processedTargets) {
		const targetHermitInfo = CARDS[target.row.hermitCard.cardId]
		const hermitAttack = target.isActive
			? attackerHermitInfo[type]?.damage || 0
			: 0

		/* --- Damage to target --- */
		const health = target.row.health
		const maxHealth = targetHermitInfo.health
		const protection = target.ignoreEffects ? 0 : target.protection
		const weaknessDamage =
			strengths.includes(targetHermitInfo.hermitType) &&
			hermitAttack + target.extraHermitDamage > 0
				? WEAKNESS_DAMAGE
				: 0
		const totalDamage = Math.max(
			(hermitAttack + target.extraHermitDamage + weaknessDamage) *
				target.multiplier +
				target.extraEffectDamage -
				protection,
			0
		)

		/* --- Revival (Totem/Scar) --- */

		if (!target.reverseDamage) {
			target.row.health = Math.min(maxHealth, health - totalDamage)
		}

		target.recovery.sort((a, b) => b.amount - a.amount)

		const isDead = target.row.health < 0
		const recovery = target.recovery[0]
		const ignoreRecovery = target.ignoreEffects && recovery?.discardEffect
		if (isDead && recovery) {
			if (!ignoreRecovery) {
				target.row.health = recovery.amount
				target.row.ailments = []
			}
			if (recovery.discardEffect) discardCard(game, target.row.effectCard)
		}

		/* --- Counter attack (TNT/Thorns/Wolf/Zed) --- */

		// from su effects & special movs
		let totalDamageToAttacker = target.backlash
		// from opponent's effects
		if (!target.ignoreEffects) totalDamageToAttacker += target.counter
		// hacky flag for Zedaph
		if (target.reverseDamage) totalDamageToAttacker += totalDamage
		// protection
		if (target.attackerProtection) {
			totalDamageToAttacker = Math.max(
				totalDamageToAttacker - target.attackerProtection,
				0
			)
		}

		// We don't need to worry about revival of attacker here
		// since there is no way to lose the totem effect card while attacking

		const attackMaxHealth = attackerHermitInfo.health
		attackerActiveRow.health = Math.min(
			attackMaxHealth,
			attackerActiveRow.health - totalDamageToAttacker
		)
	}

	const anyEffectDamage = targets.some((target) => target.extraEffectDamage)
	if (anyEffectDamage) applySingleUse(currentPlayer)

	return 'DONE'
}

export default attackSaga
