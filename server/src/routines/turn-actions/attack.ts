import {HERMIT_CARDS} from 'common/cards'
import {AttackModel} from 'common/models/attack-model'
import {GameModel} from 'common/models/game-model'
import {DEBUG_CONFIG} from 'common/config'
import {HermitAttackType} from 'common/types/attack'
import {PickedSlots} from 'common/types/pick-process'
import {PlayerState, GenericActionResult} from 'common/types/game-state'
import {CardPosModel, getCardPos} from 'common/models/card-pos-model'
import {AttackActionData, attackActionToAttack} from 'common/types/action-data'
import {getActiveRow} from 'common/utils/board'

function getAttacks(
	game: GameModel,
	attackPos: CardPosModel,
	hermitAttackType: HermitAttackType,
	pickedSlots: PickedSlots
): Array<AttackModel> {
	const {currentPlayer} = game
	const attacks: Array<AttackModel> = []

	if (!attackPos.row || !attackPos.row.hermitCard) return []

	// hermit attacks
	const hermitCard = HERMIT_CARDS[attackPos.row.hermitCard.cardId]
	attacks.push(
		...hermitCard.getAttacks(
			game,
			attackPos.row.hermitCard.cardInstance,
			attackPos,
			hermitAttackType
		)
	)

	// all other attacks
	const otherAttacks = currentPlayer.hooks.getAttacks.call()
	for (let i = 0; i < otherAttacks.length; i++) {
		attacks.push(...otherAttacks[i])
	}

	if (DEBUG_CONFIG.oneShotMode) {
		for (let i = 0; i < attacks.length; i++) {
			attacks[i].addDamage('debug', 1001)
		}
	}

	return attacks
}

function executeAttack(attack: AttackModel) {
	const {target} = attack
	if (!target) return

	const {row: targetRow} = target
	const targetHermitInfo = HERMIT_CARDS[targetRow.hermitCard.cardId]

	const currentHealth = targetRow.health
	let maxHealth = currentHealth // Armor Stand
	if (targetHermitInfo) {
		maxHealth = targetHermitInfo.health
	}

	// Deduct and clamp health
	const newHealth = Math.max(currentHealth - attack.calculateDamage(), 0)
	targetRow.health = Math.min(newHealth, maxHealth)
}

/**
 * Call before attack hooks for each attack that has an attacker
 */
function runBeforeAttackHooks(attacks: Array<AttackModel>, pickedSlots: PickedSlots = {}) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.attacker.player

		if (DEBUG_CONFIG.disableDamage) {
			attack.multiplyDamage('debug', 0).lockDamage()
		}

		// Call before attack hooks
		player.hooks.beforeAttack.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

/**
 * Call before defence hooks, based on each attack's target
 */
function runBeforeDefenceHooks(attacks: Array<AttackModel>, pickedSlots: PickedSlots = {}) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.target) continue

		// The hooks we call are determined by the target of the attack
		const player = attack.target.player

		// Call before defence hooks
		player.hooks.beforeDefence.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

/**
 * Call attack hooks for each attack that has an attacker
 */
function runOnAttackHooks(attacks: Array<AttackModel>, pickedSlots: PickedSlots = {}) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.attacker.player

		// Call on attack hooks
		player.hooks.onAttack.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

/**
 * Call defence hooks, based on each attack's target
 */
function runOnDefenceHooks(attacks: Array<AttackModel>, pickedSlots: PickedSlots = {}) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.target) continue

		// The hooks we call are determined by the target of the attack
		const player = attack.target.player

		// Call on defence hooks
		player.hooks.onDefence.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

function runAfterAttackHooks(attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]
		if (!attack.attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.attacker.player

		// Call after attack hooks
		player.hooks.afterAttack.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

function runAfterDefenceHooks(attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]
		if (!attack.target) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.target.player

		// Call after attack hooks
		player.hooks.afterDefence.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

function shouldIgnoreCard(attack: AttackModel, instance: string): boolean {
	for (let i = 0; i < attack.shouldIgnoreCards.length; i++) {
		const shouldIgnore = attack.shouldIgnoreCards[i]
		if (shouldIgnore(instance)) return true
	}
	return false
}

export function runAllAttacks(
	game: GameModel,
	attacks: Array<AttackModel>,
	pickedSlots: PickedSlots = {}
) {
	const allAttacks: Array<AttackModel> = []

	// Main attack loop
	while (attacks.length > 0) {
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
		const newAttacks: Array<AttackModel> = []
		for (let i = 0; i < attacks.length; i++) {
			newAttacks.push(...attacks[i].nextAttacks)
		}
		attacks = newAttacks
	}

	// STEP 5 - All attacks have been completed, mark actions appropriately
	game.addCompletedActions('SINGLE_USE_ATTACK', 'PRIMARY_ATTACK', 'SECONDARY_ATTACK')
	game.addBlockedActions(
		'PLAY_HERMIT_CARD',
		'PLAY_ITEM_CARD',
		'PLAY_EFFECT_CARD',
		'PLAY_SINGLE_USE_CARD',
		'CHANGE_ACTIVE_HERMIT'
	)

	// STEP 6 - Finally, after all attacks have been executed, call after attack and defence hooks
	runAfterAttackHooks(allAttacks)
	runAfterDefenceHooks(allAttacks)
}

export function executeAllAttacks(attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		executeAttack(attacks[i])
	}
}

function* attackSaga(
	game: GameModel,
	turnAction: AttackActionData,
	checkForRequests = true
): Generator<any, GenericActionResult> {
	if (!turnAction?.type) {
		return 'FAILURE_INVALID_DATA'
	}

	//@NOWTODO we do need just one request from client and server can only send back the following:
	// unchanged state with pick requests. Once the last pick/modal request is successful,/
	//we need to instantly run the attack loop and send the new state back.
	// this keeps it consistent for the client.
	// and in order for this to work I believe we simply need a "game.state.turn.currentAttack"

	const hermitAttackType = attackActionToAttack[turnAction.type]
	const {currentPlayer, opponentPlayer, state} = game
	const activeInstance = getActiveRow(currentPlayer)?.hermitCard?.cardInstance
	if (!activeInstance) return 'FAILURE_CANNOT_COMPLETE'

	if (checkForRequests) {
		// First allow cards to add attack requests
		currentPlayer.hooks.getAttackRequests.call(activeInstance, hermitAttackType)

		if (game.hasActiveRequests()) {
			// We have some pick/modal requests that we want to execute before the attack
			// The code for picking new actions will automatically send the right action back to client
			state.turn.currentAttack = hermitAttackType

			return 'SUCCESS'
		}
	}

	// Attacker
	const playerBoard = currentPlayer.board
	const attackIndex = playerBoard.activeRow
	if (attackIndex === null) return 'FAILURE_CANNOT_COMPLETE'

	const attackRow = playerBoard.rows[attackIndex]
	if (!attackRow.hermitCard) return 'FAILURE_CANNOT_COMPLETE'
	const attackPos = getCardPos(game, attackRow.hermitCard.cardInstance)
	if (!attackPos) return 'FAILURE_UNKNOWN_ERROR'

	// Defender
	const opponentBoard = opponentPlayer.board
	const defenceIndex = opponentBoard.activeRow
	if (defenceIndex === null) return 'FAILURE_CANNOT_COMPLETE'

	const defenceRow = opponentBoard.rows[defenceIndex]
	if (!defenceRow.hermitCard) return 'FAILURE_CANNOT_COMPLETE'

	// Get initial attacks
	let attacks: Array<AttackModel> = getAttacks(game, attackPos, hermitAttackType, {})

	// Run all the code stuff
	runAllAttacks(game, attacks, {})

	return 'SUCCESS'
}

export default attackSaga
