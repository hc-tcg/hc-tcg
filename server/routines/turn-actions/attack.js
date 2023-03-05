import CARDS from '../../cards'
import STRENGTHS from '../../const/strengths'
import {applySingleUse, discardCard} from '../../utils'

/**
 * @typedef {import("models/game-model").GameModel} GameModel
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 */

export const ATTACK_TO_ACTION = {
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
	zero: 'ZERO_ATTACK',
}

export const WEAKNESS_DAMAGE = 20

/**
 * @param {GameModel} game
 * @param {*} turnAction
 * @param {ActionState} actionState
 * @return {SagaIterator}
 */
function* attackSaga(game, turnAction, actionState) {
	const {
		currentPlayer,
		opponentPlayer,
		playerActiveRow,
		opponentActiveRow,
		playerHermitInfo,
	} = game.ds
	const {pickedCardsInfo} = actionState
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

	if (!attackerActiveRow || !attackerActiveRow.hermitCard) return 'INVALID'

	const attackerHermitCard = attackerActiveRow.hermitCard
	const attackerHermitInfo = CARDS[attackerHermitCard.cardId]
	if (!attackerHermitInfo) return 'INVALID'
	const strengths = STRENGTHS[attackerHermitInfo.hermitType]

	const attackerRef = {
		player: currentPlayer,
		row: attackerActiveRow,
		hermitCard: attackerHermitCard,
		hermitInfo: attackerHermitInfo,
	}
	const attackState = {
		...actionState,
		typeAction,
		// Represents actual attacker (e.g. Ren/Cleo)
		attacker: {...attackerRef},
		// Represents hermit whose attacks are being used
		moveRef: {...attackerRef},
		// Represents hermit we use for conditions (e.g. Wels health)
		condRef: {...attackerRef},
	}

	game.hooks.attackState.call(turnAction, attackState)

	const makeTarget = (row) => ({
		row,
		applyHermitDamage: row === opponentActiveRow,
		effectCardId: row.effectCard?.cardId,
		isActive: row === opponentActiveRow,
		extraEffectDamage: 0,
		extraHermitDamage: 0,
		recovery: [], // Array<{amount: number, discardEffect: boolean}>
		ignoreEffects: false,
		reverseDamage: false,
		backlash: 0,
		multiplier: 1,
	})

	const targets = {}

	// Add active row
	if (opponentActiveRow?.hermitCard) {
		const instance = opponentActiveRow.hermitCard.cardInstance
		targets[instance] = makeTarget(opponentActiveRow)
	}

	// Add picked targets (generally AFK bow/hypno)
	Object.values(pickedCardsInfo).forEach((pickedCards) => {
		if (!pickedCards.length) return
		const firstCard = pickedCards[0]
		if (firstCard.slotType !== 'hermit') return
		if (firstCard.playerId !== opponentPlayer.id) return
		if (!firstCard.row.hermitCard) return
		const instance = firstCard.card.cardInstance
		if (Object.hasOwn(targets, instance)) return
		targets[instance] = makeTarget(firstCard.row)
	})
	if (!Object.values(targets).length) return 'INVALID'

	for (let id in targets) {
		const target = targets[id]
		const result = game.hooks.attack.call(target, turnAction, attackState)
		const targetHermitInfo = CARDS[target.row.hermitCard.cardId]
		const hermitAttack = target.applyHermitDamage
			? attackerHermitInfo[type]?.damage || 0
			: 0
		const extraHermitAttack = target.applyHermitDamage
			? target.extraHermitDamage || 0
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
			hermitAttack + extraHermitAttack > 0
				? WEAKNESS_DAMAGE
				: 0
		const totalDamage =
			target.multiplier * (hermitAttack + extraHermitAttack + weaknessDamage) +
			target.extraEffectDamage

		const finalDamage = Math.max(totalDamage - protection, 0)

		const targetResult = {
			row: target.row,
			totalDamage,
			finalDamage,
			revived: false,
			died: false,
		}

		// Discard single use protective cards (Shield/Gold Armor)
		if (
			totalDamage > 0 &&
			targetEffectInfo?.protection?.discard &&
			!target.reverseDamage
		) {
			discardCard(game, target.row.effectCard)
		}

		// Deal damage
		if (!target.reverseDamage) {
			target.row.health = Math.min(maxHealth, health - finalDamage)
		}

		/* --- Revival (Totem/Scar) --- */

		target.recovery.sort((a, b) => b.amount - a.amount)

		const isDead = target.row.health <= 0
		const recovery = target.recovery[0]
		const ignoreRecovery = target.ignoreEffects && recovery?.discardEffect
		if (isDead) targetResult.died = true
		if (isDead && recovery) {
			if (!ignoreRecovery) {
				target.row.health = recovery.amount
				target.row.ailments = []
				targetResult.revived = true
				targetResult.died = false
			}
			if (recovery.discardEffect) discardCard(game, target.row.effectCard)
		}

		/* --- Counter attack (TNT/Thorns/Wolf/Zed) --- */

		const attackerEffectInfo = playerActiveRow.effectCard?.cardId
			? CARDS[playerActiveRow.effectCard?.cardId]
			: null
		const attackerProtection = attackerEffectInfo?.protection?.target || 0
		const attackerBacklash = targetEffectInfo?.protection?.backlash || 0

		// from su effects & special movs
		let totalDamageToAttacker = target.backlash
		// from opponent's effects
		if (!target.ignoreEffects && !target.reverseDamage && totalDamage > 0)
			totalDamageToAttacker += attackerBacklash
		// hacky flag for Zedaph
		if (target.reverseDamage) totalDamageToAttacker += totalDamage
		// protection
		let finalDamageToAttacker = totalDamageToAttacker
		if (attackerProtection) {
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

		targetResult.totalDamageToAttacker = totalDamageToAttacker
		targetResult.finalDamageToAttacker = finalDamageToAttacker

		game.hooks.attackResult.call(targetResult, turnAction, attackState)
	}

	const anyEffectDamage = Object.values(targets).some(
		(target) => target.extraEffectDamage
	)
	if (anyEffectDamage) applySingleUse(currentPlayer)

	// --- Provide result of attack ---

	return 'DONE'
}

export default attackSaga
