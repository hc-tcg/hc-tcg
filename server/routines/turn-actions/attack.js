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
		recovery: [], // Array<{amount: number, discardEffect: boolean}>
		ignoreEffects: false,
		reverseDamage: false,
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
		const targetEffectInfo = CARDS[target.row.effectCard?.cardId]
		const protection = target.ignoreEffects
			? 0
			: targetEffectInfo?.protection?.target || 0
		const weaknessDamage =
			strengths.includes(targetHermitInfo.hermitType) &&
			hermitAttack + target.extraHermitDamage > 0
				? WEAKNESS_DAMAGE
				: 0
		const totalDamage =
			target.multiplier *
				(hermitAttack + target.extraHermitDamage + weaknessDamage) +
			target.extraEffectDamage

		const finalDamage = Math.max(totalDamage - protection, 0)

		// Discard single use protective cards (Shield/Gold Armor)
		if (totalDamage > 0 && targetEffectInfo?.protection?.discard) {
			discardCard(game, target.row.effectCard)
		}

		// Deal damage
		if (!target.reverseDamage) {
			target.row.health = Math.min(maxHealth, health - finalDamage)
		}

		/* --- Revival (Totem/Scar) --- */

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

		const attackerEffectInfo = CARDS[playerActiveRow.effectCard?.cardId]
		const attackerProtection = attackerEffectInfo?.protection?.target || 0
		const attackerBacklash = targetEffectInfo?.protection?.backlash || 0

		// from su effects & special movs
		let totalDamageToAttacker = target.backlash
		// from opponent's effects
		if (!target.ignoreEffects && !target.reverseDamage)
			totalDamageToAttacker += attackerBacklash
		// hacky flag for Zedaph
		if (target.reverseDamage) totalDamageToAttacker += totalDamage
		// protection
		let finalDamageToAttacker = totalDamageToAttacker
		if (target.attackerProtection) {
			finalDamageToAttacker = Math.max(
				totalDamageToAttacker - attackerProtection,
				0
			)
		}

		// We don't need to worry about revival of attacker here
		// since there is no way to lose the totem effect card while attacking

		// Discard single use protective cards (Shield/Gold Armor)
		if (totalDamageToAttacker > 0 && attackerEffectInfo?.protection?.discard) {
			discardCard(game, playerActiveRow.effectCard)
		}

		const attackMaxHealth = attackerHermitInfo.health
		attackerActiveRow.health = Math.min(
			attackMaxHealth,
			attackerActiveRow.health - finalDamageToAttacker
		)
	}

	const anyEffectDamage = targets.some((target) => target.extraEffectDamage)
	if (anyEffectDamage) applySingleUse(currentPlayer)

	return 'DONE'
}

export default attackSaga
