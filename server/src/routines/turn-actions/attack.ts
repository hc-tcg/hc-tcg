import {HERMIT_CARDS} from 'common/cards'
import {AttackModel} from 'common/models/attack-model'
import {GameModel} from 'common/models/game-model'
import {DEBUG_CONFIG} from 'common/config'
import {HermitAttackType} from 'common/types/attack'
import {PickedSlots} from 'common/types/pick-process'
import {SagaIterator} from 'redux-saga'
import {PlayerState} from 'common/types/game-state'
import {CardPosModel, getCardPos} from 'common/models/card-pos-model'

export const ATTACK_TO_ACTION = {
	primary: 'PRIMARY_ATTACK',
	secondary: 'SECONDARY_ATTACK',
	zero: 'ZERO_ATTACK',
}

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
			hermitAttackType,
			pickedSlots
		)
	)

	// all other attacks
	const otherAttacks = currentPlayer.hooks.getAttacks.call(pickedSlots)
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
		player.hooks.beforeAttack.callSome([attack, pickedSlots], (instance) => {
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
		player.hooks.beforeDefence.callSome([attack, pickedSlots], (instance) => {
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
		player.hooks.onAttack.callSome([attack, pickedSlots], (instance) => {
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
		player.hooks.onDefence.callSome([attack, pickedSlots], (instance) => {
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

export function runAllAttacks(attacks: Array<AttackModel>, pickedSlots: PickedSlots = {}) {
	/** @type {Array<AttackModel>} */
	const allAttacks: Array<AttackModel> = []

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
		const newAttacks: Array<AttackModel> = []
		for (let i = 0; i < attacks.length; i++) {
			newAttacks.push(...attacks[i].nextAttacks)
		}
		attacks = newAttacks
	}

	// STEP 5 - Finally, after all attacks have been executed, call after attack and defence hooks
	runAfterAttackHooks(allAttacks)
	runAfterDefenceHooks(allAttacks)
}

function* attackSaga(game: GameModel, turnAction: any, actionState: any): SagaIterator {
	// defining things
	const {currentPlayer, opponentPlayer: opponentPlayer} = game
	const {pickedSlots} = actionState

	/** @type {HermitAttackType} */
	const hermitAttackType: HermitAttackType = turnAction.payload.type

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
	let attacks: Array<AttackModel> = getAttacks(game, attackPos, hermitAttackType, pickedSlots)

	// Run all the code stuff
	runAllAttacks(attacks, pickedSlots)

	return 'DONE'
}

export function runAilmentAttacks(game: GameModel, player: PlayerState) {
	/** @type {Array<AttackModel>} */
	let attacks: Array<AttackModel> = []

	// Get ailment attacks
	for (let i = 0; i < player.board.rows.length; i++) {
		const row = player.board.rows[i]
		if (!row.health) continue

		const hasFire = !!row.ailments.find((a) => a.id === 'fire')
		const hasPoison = !!row.ailments.find((a) => a.id === 'poison')

		// NOTE - only ailment attacks have no attacker, all others do
		const attack = new AttackModel({
			id: hasFire ? 'fire' : hasPoison ? 'poison' : undefined,
			target: {
				player,
				rowIndex: i,
				row,
			},
			type: 'ailment',
		})

		if (hasFire) {
			attacks.push(attack.addDamage('ailment', 20))
		} else if (hasPoison) {
			// Calculate max poison damage
			const poisonDamage = Math.max(Math.min(row.health - 10, 20), 0)
			attacks.push(attack.addDamage('ailment', poisonDamage))
		}
	}

	// Run the code for the attacks
	runAllAttacks(attacks)
}

export default attackSaga
