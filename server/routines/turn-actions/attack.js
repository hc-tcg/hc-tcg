import {
	HERMIT_CARDS,
	EFFECT_CARDS,
	SINGLE_USE_CARDS,
} from '../../../common/cards'
import STRENGTHS from '../../const/strengths'
import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, discardCard} from '../../utils'

/**
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 * @typedef {import('common/types/attack').HermitAttackType} HermitAttackType
 * @typedef {import('common/types/attack').AttackResult} AttackResult
 * @typedef {import('common/types/game-state').RowStateWithHermit} RowStateWithHermit
 */

export const ATTACK_TO_ACTION = {
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
	zero: 'ZERO_ATTACK',
}

export const WEAKNESS_DAMAGE = 20

/**
 *
 * @param {GameModel} game
 * @param {RowStateWithHermit} attackRow
 * @param {HermitAttackType} hermitAttackType
 * @param {import('common/types/pick-process').PickedSlotsInfo} pickedSlots
 * @returns {Array<AttackModel>}
 */
function getAttacks(game, attackRow, hermitAttackType, pickedSlots) {
	const {currentPlayer} = game.ds
	const attacks = []

	// hermit attacks
	const hermitCard = HERMIT_CARDS[attackRow.hermitCard.cardId]
	attacks.push(
		...hermitCard.getAttacks(
			game,
			attackRow.hermitCard.cardInstance,
			hermitAttackType,
			pickedSlots
		)
	)

	// all other attacks
	const otherAttacks = Object.values(currentPlayer.hooks.getAttacks)
	for (let i = 0; i < otherAttacks.length; i++) {
		attacks.push(...otherAttacks[i](pickedSlots))
	}

	// @TODO Weakness attack
	//const weaknessAttack = new AttackModel(
	//	{index: attackIndex, row: attackRow},
	//	{index: defenceIndex, row: defenceRow},
	//	'weakness'
	//)

	return attacks
}

/**
 *
 * @param {GameModel} game
 * @param {AttackModel} attack
 * @returns {AttackResult}
 */
function executeAttack(game, attack) {
	const {target, damage, damageMultiplier, defence} = attack

	// Calculate damage
	const initialDamage = damage * damageMultiplier
	const finalDamage = Math.max(initialDamage - defence.damageReduction, 0)

	const {row: targetRow} = target
	const targetHermitInfo = HERMIT_CARDS[targetRow.hermitCard.cardId]

	const currentHealth = targetRow.health
	const maxHealth = targetHermitInfo.health

	// Deduct and clamp health
	const newHealth = Math.max(currentHealth - finalDamage, 0)
	targetRow.health = Math.min(newHealth, maxHealth)

	/** @type {AttackResult} */
	const result = {
		attack,
		totalDamage: currentHealth - newHealth,
		blockedDamage: initialDamage - finalDamage,
	}

	// Attack result
	return result
}

/**
 * Returns if we should ignore the hooks for an instance or not
 * @param {AttackModel} attack
 * @param {string} instance
 * @returns {boolean}
 */
function shouldIgnoreCard(attack, instance) {
	for (let i = 0; i < attack.shouldIgnoreCards.length; i++) {
		const shouldIgnore = attack.shouldIgnoreCards[i]
		if (shouldIgnore(instance)) return true
	}
	return false
}

/**
 * @param {GameModel} game
 * @param {TurnAction} turnAction
 * @param {ActionState} actionState
 * @return {SagaIterator}
 */
function* attackSaga(game, turnAction, actionState) {
	// defining things
	const {currentPlayer, opponentPlayer} = game.ds
	const {pickedSlotsInfo} = actionState

	/** @type {HermitAttackType} */
	const hermitAttackType = turnAction.payload.type

	if (!hermitAttackType) {
		console.log('Unknown attack type: ', hermitAttackType)
		return 'INVALID'
	}
	// TODO - send hermitCard from frontend for validation?

	// Attacker
	const playerBoard = currentPlayer.board
	const attackIndex = playerBoard.activeRow
	if (attackIndex === null) return 'INVALID'

	const attackRow = playerBoard.rows[attackIndex]
	if (!attackRow.hermitCard) return 'INVALID'

	// Defender
	const opponentBoard = opponentPlayer.board
	const defenceIndex = opponentBoard.activeRow
	if (defenceIndex === null) return 'INVALID'

	const defenceRow = opponentBoard.rows[defenceIndex]
	if (!defenceRow.hermitCard) return 'INVALID'

	// Get initial attacks
	/** @type {Array<AttackModel>} */
	let attacks = getAttacks(game, attackRow, hermitAttackType, pickedSlotsInfo)

	console.log('We got', attacks.length, 'attacks')

	// Main attack loop
	while (attacks.length > 0) {
		// Process all current attacks one at a time

		// STEP 1 - Call before attack for all attacks
		const beforeAttackKeys = Object.keys(currentPlayer.hooks.beforeAttack)
		const beforeAttacks = Object.values(currentPlayer.hooks.beforeAttack)
		for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
			const attack = attacks[attackIndex]

			for (let i = 0; i < beforeAttackKeys.length; i++) {
				const instance = beforeAttackKeys[i]
				// if we are not ignoring this hook, call it
				if (!shouldIgnoreCard(attack, instance)) {
					beforeAttacks[i](attack)
				}
			}
		}

		// STEP 2 - Call on attack for all attacks
		const onAttackKeys = Object.keys(currentPlayer.hooks.onAttack)
		const onAttacks = Object.values(currentPlayer.hooks.onAttack)
		for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
			const attack = attacks[attackIndex]

			for (let i = 0; i < onAttackKeys.length; i++) {
				const instance = onAttackKeys[i]
				// if we are not ignoring this hook, call it
				if (!shouldIgnoreCard(attack, instance)) {
					onAttacks[i](attack, pickedSlotsInfo)
				}
			}
		}

		// STEP 3 - Execute all attacks, and store the results
		/** @type {Array<AttackResult>} */
		const results = []
		for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
			const result = executeAttack(game, attacks[attackIndex])
			results.push(result)
		}

		// STEP 4 - Call afterAttack for all results
		const afterAttackKeys = Object.keys(currentPlayer.hooks.afterAttack)
		const afterAttacks = Object.values(currentPlayer.hooks.afterAttack)
		for (let resultsIndex = 0; resultsIndex < results.length; resultsIndex++) {
			const result = results[resultsIndex]

			for (let i = 0; i < afterAttackKeys.length; i++) {
				const instance = afterAttackKeys[i]
				// if we are not ignoring this hook, call it
				if (!shouldIgnoreCard(result.attack, instance)) {
					afterAttacks[i](result)
				}
			}
		}

		// STEP 5 - Finally, get all the next attacks, and repeat the process
		const newAttacks = []
		for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
			newAttacks.push(...attacks[attackIndex].nextAttacks)
		}
		attacks = newAttacks
	}

	return 'DONE'
}

export default attackSaga
