import {
	HERMIT_CARDS,
	EFFECT_CARDS,
	SINGLE_USE_CARDS,
} from '../../../common/cards'
import STRENGTHS from '../../const/strengths'
import {AttackModel} from '../../models/attack-model'
import {GameModel} from '../../models/game-model'
import {getCardPos} from '../../utils/cards'
import {DEBUG_CONFIG} from '../../../config'

/**
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 * @typedef {import('common/types/attack').HermitAttackType} HermitAttackType
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

	// Weakness attacks
	// I'm assuming attacks being redirected do not affect weakness attacks.
	// That means that for example Ranbob would not create a weakness attack
	// if there's a hermit card on the other side.
	const weaknessAttacks = []
	for (const attack of attacks) {
		const {target, attacker} = attack
		if (!target || !attacker) continue

		const attackerCardInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
		const targetCardInfo = HERMIT_CARDS[target.row.hermitCard.cardId]
		if (!attackerCardInfo || !targetCardInfo) continue

		const attackId = attackerCardInfo.getInstanceKey(
			attacker.row.hermitCard.cardInstance,
			'weakness'
		)

		const strength = STRENGTHS[attackerCardInfo.hermitType]
		const hasWeakness = target.row.ailments.find((a) => a.id === 'weakness')
		if (!strength.includes(targetCardInfo.hermitType) && !hasWeakness) continue

		const weaknessAttack = new AttackModel({
			id: attackId,
			attacker,
			target,
			type: 'weakness',
		})

		weaknessAttack.addDamage(WEAKNESS_DAMAGE)
		weaknessAttacks.push(weaknessAttack)
	}

	attacks.push(...weaknessAttacks)

	if (DEBUG_CONFIG.oneShotMode) {
		for (let i = 0; i < attacks.length; i++) {
			attacks[i].damage = 9001
		}
	}

	return attacks
}

/**
 * @param {AttackModel} attack
 */
function executeAttack(attack) {
	const {target, damage, damageMultiplier, damageReduction} = attack

	// Calculate damage
	const finalDamage = Math.max(damage * damageMultiplier - damageReduction, 0)

	const {row: targetRow} = target
	const targetHermitInfo = HERMIT_CARDS[targetRow.hermitCard.cardId]

	const currentHealth = targetRow.health
	const maxHealth = targetHermitInfo.health

	// Deduct and clamp health
	const newHealth = Math.max(currentHealth - finalDamage, 0)
	targetRow.health = Math.min(newHealth, maxHealth)
}

/**
 * Call before attack hooks for each attack that has an attacker
 * @param {Array<AttackModel>} attacks
 * @param {import('types/pick-process').PickedSlots} pickedSlots
 */
function runBeforeAttackHooks(attacks, pickedSlots = {}) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.attacker.player
		const beforeAttackKeys = Object.keys(player.hooks.beforeAttack)
		const beforeAttacks = Object.values(player.hooks.beforeAttack)

		if (DEBUG_CONFIG.disableDamage) {
			attack.reduceDamage(attack.damage)
			attack.lockDamage()
		}

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
 * Call before defence hooks, based on each attack's target
 * @param {Array<AttackModel>} attacks
 * @param {import('types/pick-process').PickedSlots} pickedSlots
 */
function runBeforeDefenceHooks(attacks, pickedSlots = {}) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]

		// The hooks we call are determined by the target of the attack
		const player = attack.target.player
		const beforeDefenceKeys = Object.keys(player.hooks.beforeDefence)
		const beforeDefenceHooks = Object.values(player.hooks.beforeDefence)

		for (let i = 0; i < beforeDefenceKeys.length; i++) {
			const instance = beforeDefenceKeys[i]
			// if we are not ignoring this hook, call it
			if (!shouldIgnoreCard(attack, instance)) {
				beforeDefenceHooks[i](attack, pickedSlots)
			}
		}
	}
}

/**
 * Call attack hooks for each attack that has an attacker
 * @param {Array<AttackModel>} attacks
 * @param {import('types/pick-process').PickedSlots} pickedSlots
 */
function runOnAttackHooks(attacks, pickedSlots = {}) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.attacker.player
		const onAttackKeys = Object.keys(player.hooks.onAttack)
		const onAttacks = Object.values(player.hooks.onAttack)

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
 * Call defence hooks, based on each attack's target
 * @param {Array<AttackModel>} attacks
 * @param {import('types/pick-process').PickedSlots} pickedSlots
 */
function runOnDefenceHooks(attacks, pickedSlots = {}) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]

		// The hooks we call are determined by the target of the attack
		const player = attack.target.player
		const onDefenceKeys = Object.keys(player.hooks.onDefence)
		const onDefenceHooks = Object.values(player.hooks.onDefence)

		for (let i = 0; i < onDefenceKeys.length; i++) {
			const instance = onDefenceKeys[i]
			// if we are not ignoring this hook, call it
			if (!shouldIgnoreCard(attack, instance)) {
				onDefenceHooks[i](attack, pickedSlots)
			}
		}
	}
}

/**
 * Call after attack hooks for each attack that has an attacker
 * @param {Array<AttackModel>} attacks
 */
function runAfterAttackHooks(attacks) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]
		if (!attack.attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.attacker.player
		const afterAttackKeys = Object.keys(player.hooks.afterAttack)
		const afterAttackHooks = Object.values(player.hooks.afterAttack)

		for (let i = 0; i < afterAttackKeys.length; i++) {
			const instance = afterAttackKeys[i]
			// if we are not ignoring this hook, call it
			if (!shouldIgnoreCard(attack, instance)) {
				afterAttackHooks[i](attack)
			}
		}
	}
}

/**
 * Call after defence hooks, based on each attack's target
 * @param {Array<AttackModel>} attacks
 */
function runAfterDefenceHooks(attacks) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]

		// The hooks we call are determined by the source of the attack
		const player = attack.target.player
		const afterDefenceKeys = Object.keys(player.hooks.afterDefence)
		const afterDefenceHooks = Object.values(player.hooks.afterDefence)

		for (let i = 0; i < afterDefenceKeys.length; i++) {
			const instance = afterDefenceKeys[i]
			// if we are not ignoring this hook, call it
			if (!shouldIgnoreCard(attack, instance)) {
				afterDefenceHooks[i](attack)
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
 *
 * @param {Array<AttackModel>} attacks
 * @param {import('types/pick-process').PickedSlots} pickedSlots
 */
function runAllAttacks(attacks, pickedSlots = {}) {
	/** @type {Array<AttackModel>} */
	const allAttacks = []

	// Main attack loop
	while (attacks.length > 0) {
		// Process all current attacks one at a time

		// STEP 1 - Call before attack and defence for all attacks
		runBeforeAttackHooks(attacks, pickedSlots)
		runBeforeDefenceHooks(attacks, pickedSlots)

		// STEP 2 - Call on attack and defence for all attacks
		runOnAttackHooks(attacks, pickedSlots)
		runOnDefenceHooks(attacks, pickedSlots)

		// STEP 3 - Execute all attacks
		for (let i = 0; i < attacks.length; i++) {
			executeAttack(attacks[i])

			// Add this attack to the final list
			allAttacks.push(attacks[i])
		}

		// STEP 4 - Get all the next attacks, and repeat the process
		const newAttacks = []
		for (let i = 0; i < attacks.length; i++) {
			newAttacks.push(...attacks[i].nextAttacks)
		}
		attacks = newAttacks
	}

	// STEP 5 - Finally, after all attacks have been executed, call after attack and defence hooks
	runAfterAttackHooks(allAttacks)
	runAfterDefenceHooks(allAttacks)
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

	// Run all the code stuff
	runAllAttacks(attacks, pickedSlots)

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

		// NOTE - only ailment attacks have no attacker, all others do
		const attack = new AttackModel({
			target: {
				player,
				rowIndex: i,
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
	runAllAttacks(attacks)
}

export default attackSaga
