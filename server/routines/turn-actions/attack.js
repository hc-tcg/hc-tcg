import {
	HERMIT_CARDS,
	EFFECT_CARDS,
	SINGLE_USE_CARDS,
} from '../../../common/cards'
import STRENGTHS from '../../const/strengths'
import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, discardCard} from '../../utils'
import {getCardPos} from '../../utils/cards'

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
 * @param {import('common/types/cards').CardPos} attackPos
 * @param {HermitAttackType} hermitAttackType
 * @param {import('common/types/pick-process').PickedSlots} pickedSlots
 * @returns {Array<AttackModel>}
 */
function getAttacks(game, attackPos, hermitAttackType, pickedSlots) {
	const {currentPlayer} = game.ds
	const attacks = []

	if (!attackPos.row || !attackPos.row.hermitCard) return []

	// hermit attacks
	const hermitCard = HERMIT_CARDS[attackPos.row.hermitCard.cardId]
	attacks.push(
		...hermitCard.getAttacks(
			game,
			attackPos.row.hermitCard.cardInstance,
			attackPos,
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
 *
 * @param {PlayerState} player
 * @param {Array<AttackModel>} attacks
 * @param {import('types/pick-process').PickedSlots} pickedSlots
 */
function runBeforeAttacks(player, attacks, pickedSlots = {}) {
	const beforeAttackKeys = Object.keys(player.hooks.beforeAttack)
	const beforeAttacks = Object.values(player.hooks.beforeAttack)
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]

		for (let i = 0; i < beforeAttackKeys.length; i++) {
			const instance = beforeAttackKeys[i]
			// if we are not ignoring this hook, call it
			if (!shouldIgnoreCard(attack, instance)) {
				beforeAttacks[i](attack, pickedSlots)
			}
		}
	}
}

/**
 *
 * @param {PlayerState} player
 * @param {Array<AttackModel>} attacks
 * @param {import('types/pick-process').PickedSlots} pickedSlots
 */
function runOnAttacks(player, attacks, pickedSlots = {}) {
	const onAttackKeys = Object.keys(player.hooks.onAttack)
	const onAttacks = Object.values(player.hooks.onAttack)
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]

		for (let i = 0; i < onAttackKeys.length; i++) {
			const instance = onAttackKeys[i]
			// if we are not ignoring this hook, call it
			if (!shouldIgnoreCard(attack, instance)) {
				onAttacks[i](attack, pickedSlots)
			}
		}
	}
}

/**
 *
 * @param {GameModel} game
 * @param {Array<AttackModel>} attacks
 * @returns {Array<AttackResult>}
 */
function executeAttacks(game, attacks) {
	/** @type {Array<AttackResult>} */
	const results = []
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const result = executeAttack(game, attacks[attackIndex])
		results.push(result)
	}
	return results
}

/**
 *
 * @param {PlayerState} player
 * @param {Array<AttackResult>} results
 */
function runAfterAttacks(player, results) {
	const afterAttackKeys = Object.keys(player.hooks.afterAttack)
	const afterAttacks = Object.values(player.hooks.afterAttack)
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
	const {pickedSlots} = actionState

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
	const attackPos = getCardPos(game, attackRow.hermitCard.cardInstance)
	if (!attackPos) return 'INVALID'

	// Defender
	const opponentBoard = opponentPlayer.board
	const defenceIndex = opponentBoard.activeRow
	if (defenceIndex === null) return 'INVALID'

	const defenceRow = opponentBoard.rows[defenceIndex]
	if (!defenceRow.hermitCard) return 'INVALID'

	// Get initial attacks
	/** @type {Array<AttackModel>} */
	let attacks = getAttacks(game, attackPos, hermitAttackType, pickedSlots)

	console.log('We got', attacks.length, 'attacks')

	// Store all results
	/** @type {Array<AttackResult>} */
	const results = []

	// Main attack loop
	while (attacks.length > 0) {
		// Process all current attacks one at a time

		// STEP 1 - Call before attack for all attacks
		runBeforeAttacks(currentPlayer, attacks, pickedSlots)

		// STEP 2 - Call on attack for all attacks
		runOnAttacks(currentPlayer, attacks, pickedSlots)

		// STEP 3 - Execute all attacks, and store the results
		results.push(...executeAttacks(game, attacks))

		// STEP 4 - Get all the next attacks, and repeat the process
		const newAttacks = []
		for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
			newAttacks.push(...attacks[attackIndex].nextAttacks)
		}
		attacks = newAttacks
	}

	// STEP 5 - Finally, call afterAttack for all results
	runAfterAttacks(currentPlayer, results)

	return 'DONE'
}

/**
 * @param {GameModel} game
 * @param {PlayerState} player
 */
export function runAilmentAttacks(game, player) {
	/** @type {Array<AttackModel>} */
	let attacks = []

	// Get ailment attacks
	for (let i = 0; i < player.board.rows.length; i++) {
		const row = player.board.rows[i]
		if (!row.health) continue

		const attack = new AttackModel({
			target: {
				index: i,
				row,
			},
			type: 'ailment',
		})

		if (row.ailments.find((a) => a.id === 'fire')) {
			attack.id = 'fire'
			attacks.push(attack.addDamage(20))
		}

		if (row.ailments.find((a) => a.id === 'poison')) {
			attack.id = 'poison'

			// Calculate max poison damage
			const poisonDamage = Math.max(Math.min(row.health - 10, 20), 0)
			attacks.push(attack.addDamage(poisonDamage))
		}
	}

	// Run the code for the attacks

	// Store all results
	/** @type {Array<AttackResult>} */
	const results = []

	// Main attack loop
	while (attacks.length > 0) {
		// STEP 1 - Call before attack for all attacks
		runBeforeAttacks(player, attacks)

		// STEP 2 - Call on attack for all attacks
		runOnAttacks(player, attacks)

		// STEP 3 - Execute all attacks, and store the results
		results.push(...executeAttacks(game, attacks))

		// STEP 4 - Get all the next attacks, and repeat the process
		const newAttacks = []
		for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
			newAttacks.push(...attacks[attackIndex].nextAttacks)
		}
		attacks = newAttacks
	}

	// STEP 5 - Finally, call afterAttack for all results
	runAfterAttacks(player, results)
}

export default attackSaga
