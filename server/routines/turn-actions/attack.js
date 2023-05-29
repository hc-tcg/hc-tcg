import {AttackModel} from '../../models/attack-model'
import {HERMIT_CARDS, EFFECT_CARDS, SINGLE_USE_CARDS} from '../../cards'
import STRENGTHS from '../../const/strengths'
import {applySingleUse, discardCard} from '../../utils'
import EffectCard from '../../cards/card-plugins/effects/_effect-card'
import HermitCard from '../../cards/card-plugins/hermits/_hermit-card'
import SingleUseCard from '../../cards/card-plugins/single-use/_single-use-card'

/**
 * @typedef {import("models/game-model").GameModel} GameModel
 * @typedef {import("redux-saga").SagaIterator} SagaIterator
 * @typedef {import('common/types/game-state').RowStateWithHermit} RowStateWithHermit
 * @typedef {import("common/types/cards").HermitCardT} HermitCardT
 * @typedef {import("common/types/cards").EffectCardT} EffectCardT
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
 * @param {import('models/attack-model').HermitAttackType} hermitAttackType
 * @returns {Array<AttackModel>}
 */
function getAttacks(game, attackRow, hermitAttackType) {
	const attacks = []

	// hermit attacks
	const hermitCard = HERMIT_CARDS[attackRow.hermitCard.cardId]
	attacks.push(
		...hermitCard.getAttacks(
			game,
			attackRow.hermitCard.cardInstance,
			hermitAttackType
		)
	)

	// effect attacks
	if (attackRow.effectCard) {
		const effectClass = EFFECT_CARDS[attackRow.effectCard.cardId]
		attacks.push(
			...effectClass.getAttacks(game, attackRow.effectCard.cardInstance)
		)
	}

	// single use attacks
	const playerBoard = game.ds.currentPlayer.board
	if (playerBoard.singleUseCard && !playerBoard.singleUseCardUsed) {
		const singleUseClass = SINGLE_USE_CARDS[playerBoard.singleUseCard.cardId]
		attacks.push(
			...singleUseClass.getAttacks(game, playerBoard.singleUseCard.cardInstance)
		)
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
 */
function runOverrides(game, attack) {
	const {currentPlayer, opponentPlayer} = game.ds
	const playerBoard = currentPlayer.board

	// First check our side of the board for overrides
	for (let rowIndex = 0; rowIndex < playerBoard.rows.length; rowIndex++) {
		const row = playerBoard.rows[rowIndex]
		if (!row.hermitCard) continue

		HERMIT_CARDS[row.hermitCard.cardId].overrideAttack(
			game,
			row.hermitCard.cardInstance,
			attack
		)

		if (!row.effectCard) continue
		EFFECT_CARDS[row.effectCard.cardId].overrideAttack(
			game,
			row.effectCard.cardInstance,
			attack
		)
	}

	// Our single use card
	if (playerBoard.singleUseCard && !playerBoard.singleUseCardUsed) {
		const singleUseClass = SINGLE_USE_CARDS[playerBoard.singleUseCard.cardId]
		singleUseClass.overrideAttack(
			game,
			playerBoard.singleUseCard.cardInstance,
			attack
		)
	}

	// Then check opponent cards for overrides
	for (
		let rowIndex = 0;
		rowIndex < opponentPlayer.board.rows.length;
		rowIndex++
	) {
		const row = opponentPlayer.board.rows[rowIndex]
		if (!row.hermitCard) continue

		HERMIT_CARDS[row.hermitCard.cardId].overrideDefence(
			game,
			row.hermitCard.cardInstance,
			attack
		)

		if (!row.effectCard) continue
		EFFECT_CARDS[row.effectCard.cardId].overrideDefence(
			game,
			row.effectCard.cardInstance,
			attack
		)
	}
}

/**
 *
 * @param {GameModel} game
 * @param {AttackModel} attack
 */
function runAttackCode(game, attack) {
	// Go through attacker's cards
	if (attack.attacker) {
		const {row} = attack.attacker

		// Hermit card
		HERMIT_CARDS[row.hermitCard.cardId].onAttack(
			game,
			row.hermitCard.cardInstance,
			attack
		)

		// Effect card
		if (row.effectCard) {
			EFFECT_CARDS[row.effectCard.cardId].onAttack(
				game,
				row.effectCard.cardInstance,
				attack
			)
		}

		// Single use card
		const playerBoard = game.ds.currentPlayer.board
		if (playerBoard.singleUseCard && !playerBoard.singleUseCardUsed) {
			SINGLE_USE_CARDS[playerBoard.singleUseCard.cardId].onAttack(
				game,
				playerBoard.singleUseCard.cardInstance,
				attack
			)
		}
	}
}

/**
 *
 * @param {GameModel} game
 * @param {AttackModel} attack
 */
function runDefenceCode(game, attack) {
	// Go through target's cards
	const {row: targetRow} = attack.target

	// Target hermit card
	HERMIT_CARDS[targetRow.hermitCard.cardId].onDefence(
		game,
		targetRow.hermitCard.cardInstance,
		attack
	)

	// Target effect card - if not ignored
	if (targetRow.effectCard && !attack.ignoreAttachedEffects) {
		EFFECT_CARDS[targetRow.effectCard.cardId].onDefence(
			game,
			targetRow.hermitCard.cardInstance,
			attack
		)
	}
}

/**
 *
 * @param {GameModel} game
 * @param {AttackModel} attack
 * @returns {import('../../models/attack-model').AttackResult}
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

	/** @type {import('../../models/attack-model').AttackResult} */
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
 * @param {GameModel} game
 * @param {import('../../models/attack-model').AttackResult} result
 */
function sendAttackResult(game, result) {
	const {attack} = result
	// Go through attacker's cards
	if (attack.attacker) {
		const {row} = attack.attacker

		// Hermit card
		HERMIT_CARDS[row.hermitCard.cardId].afterAttack(
			game,
			row.hermitCard.cardInstance,
			result
		)

		// Effect card
		if (row.effectCard) {
			EFFECT_CARDS[row.effectCard.cardId].afterAttack(
				game,
				row.effectCard.cardInstance,
				result
			)
		}

		// Single use card
		const playerBoard = game.ds.currentPlayer.board
		if (playerBoard.singleUseCard && !playerBoard.singleUseCardUsed) {
			SINGLE_USE_CARDS[playerBoard.singleUseCard.cardId].afterAttack(
				game,
				playerBoard.singleUseCard.cardInstance,
				result
			)
		}
	}

	// Go through target's cards
	const {row: targetRow} = attack.target

	// Target hermit card
	HERMIT_CARDS[targetRow.hermitCard.cardId].afterDefence(
		game,
		targetRow.hermitCard.cardInstance,
		result
	)

	// Target effect card - if not ignored
	if (targetRow.effectCard && !attack.ignoreAttachedEffects) {
		EFFECT_CARDS[targetRow.effectCard.cardId].afterDefence(
			game,
			targetRow.hermitCard.cardInstance,
			result
		)
	}
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

	//@TODO we are currently doing nothing with picked cards
	const {pickedCardsInfo} = actionState

	const {type} = turnAction.payload
	/** @type {import('../../models/attack-model').HermitAttackType} */
	const hermitAttackType = ATTACK_TO_ACTION[type]
	if (!hermitAttackType) {
		console.log('Unknown attack type: ', type)
		return 'INVALID'
	}
	// TODO - send hermitCard from frontend for validation?

	// Attacker
	const playerBoard = currentPlayer.board
	const attackIndex = playerBoard.activeRow
	if (!attackIndex) return 'INVALID'

	const attackRow = playerBoard.rows[attackIndex]
	if (!attackRow.hermitCard) return 'INVALID'

	// Defender
	const defenceBoard = opponentPlayer.board
	const defenceIndex = defenceBoard.activeRow
	if (!defenceIndex) return 'INVALID'

	const defenceRow = defenceBoard.rows[attackIndex]
	if (!defenceRow.hermitCard) return 'INVALID'

	// Get initial attacks
	/** @type {Array<AttackModel>} */
	let attacks = getAttacks(game, attackRow, hermitAttackType)

	// Main attack loop
	while (attacks.length > 0) {
		/** @type {Array<AttackModel>} */
		const nextAttacks = []

		// Process all current attacks one at a time
		for (let i = 0; i < attacks.length; i++) {
			const attack = attacks[i]

			// Checks all cards on the board to see if they want to override this attack
			runOverrides(game, attack)
			// Runs onAttack for all cards on attackers row
			runAttackCode(game, attack)
			// Runs onDefense for all cards on targets row
			runDefenceCode(game, attack)

			// Apply the damage
			const result = executeAttack(game, attack)

			//@TODO will attack object be able ot be modified by attack result? it's technically one object
			sendAttackResult(game, result)

			nextAttacks.push(...attack.nextAttacks)
		}

		// Loop round, doing everything again with our next set of attacks
		attacks = nextAttacks
	}

	// @TODO check for hermit death after all attacks

	return 'DONE'
}

export default attackSaga
