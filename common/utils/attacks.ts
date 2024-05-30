import {STRENGTHS} from '../const/strengths'
import {HERMIT_CARDS} from '../cards'
import {AttackModel} from '../models/attack-model'
import {WEAKNESS_DAMAGE} from '../const/damage'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {EnergyT, RowPos} from '../types/cards'
import {DEBUG_CONFIG} from '../config'
import {GameModel} from '../models/game-model'

function executeAttack(attack: AttackModel) {
	const target = attack.getTarget()
	if (!target) return

	const {row} = target
	if (!row.hermitCard) return

	const currentHealth = row.health

	const weaknessAttack = createWeaknessAttack(attack)
	if (weaknessAttack) attack.addNewAttack(weaknessAttack)

	// Deduct and clamp health
	const newHealth = Math.max(currentHealth - attack.calculateDamage(), 0)
	row.health = Math.min(newHealth, currentHealth)
}

/**
 * Call before attack hooks for each attack that has an attacker
 */
function runBeforeAttackHooks(attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		const attacker = attack.getAttacker()
		if (!attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attacker.player

		if (DEBUG_CONFIG.disableDamage) {
			attack.multiplyDamage('debug', 0).lockDamage('debug')
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
function runBeforeDefenceHooks(attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		const target = attack.getTarget()
		if (!target) continue

		// The hooks we call are determined by the target of the attack
		const player = target.player

		// Call before defence hooks
		player.hooks.beforeDefence.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

/**
 * Call attack hooks for each attack that has an attacker
 */
function runOnAttackHooks(attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		const attacker = attack.getAttacker()
		if (!attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attacker.player

		// Call on attack hooks
		player.hooks.onAttack.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

/**
 * Call defence hooks, based on each attack's target
 */
function runOnDefenceHooks(attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		const target = attack.getTarget()
		if (!target) continue

		// The hooks we call are determined by the target of the attack
		const player = target.player

		// Call on defence hooks
		player.hooks.onDefence.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

function runAfterAttackHooks(attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]
		const attacker = attack.getAttacker()
		if (!attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attacker.player

		// Call after attack hooks
		player.hooks.afterAttack.callSome([attack], (instance) => {
			return shouldIgnoreCard(attack, instance)
		})
	}
}

function runAfterDefenceHooks(attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]
		const target = attack.getTarget()
		if (!target) continue

		// The hooks we call are determined by the source of the attack
		const player = target.player

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

export function executeAttacks(
	game: GameModel,
	attacks: Array<AttackModel>,
	withoutBlockingActions = false,
	createLogs = true
) {
	// We need to store the SU card for battle log stuff.
	const thisAttackSagaSU = game.currentPlayer.board.singleUseCard

	// STEP 1 - Call before attack and defence for all attacks
	runBeforeAttackHooks(attacks)
	runBeforeDefenceHooks(attacks)

	// STEP 2 - Call on attack and defence for all attacks
	runOnAttackHooks(attacks)
	runOnDefenceHooks(attacks)

	// STEP 3 - Execute all attacks
	attacks.forEach((attack) => {
		executeAttack(attack)

		if (attack.nextAttacks.length > 0) {
			executeAttacks(game, attack.nextAttacks, withoutBlockingActions, false)
		}

		if (createLogs) {
			game.battleLog.addAttackEntry(attack, game.currentPlayer.coinFlips, thisAttackSagaSU)
		}

		attack.nextAttacks = []
	})

	if (!withoutBlockingActions) {
		// STEP 5 - All attacks have been completed, mark actions appropriately
		game.addCompletedActions('SINGLE_USE_ATTACK', 'PRIMARY_ATTACK', 'SECONDARY_ATTACK')
		game.addBlockedActions(
			'game',
			'PLAY_HERMIT_CARD',
			'PLAY_ITEM_CARD',
			'PLAY_EFFECT_CARD',
			'PLAY_SINGLE_USE_CARD',
			'CHANGE_ACTIVE_HERMIT'
		)
	}

	// STEP 6 - After all attacks have been executed, call after attack and defence hooks
	runAfterAttackHooks(attacks)
	runAfterDefenceHooks(attacks)

	// STEP 7 - Execute new attacks created in afterAttack hooks
	attacks.forEach((attack) => {
		if (attack.nextAttacks.length === 0) return
		executeAttacks(game, attack.nextAttacks, true, true)
	})
}

export function executeExtraAttacks(
	game: GameModel,
	attacks: Array<AttackModel>,
	withoutBlockingActions = false
) {
	executeAttacks(game, attacks, withoutBlockingActions)
	game.battleLog.sendLogs()
}

// Things not directly related to the attack loop

export function hasEnoughEnergy(energy: Array<EnergyT>, cost: Array<EnergyT>) {
	if (DEBUG_CONFIG.noItemRequirements) return true

	const remainingEnergy = energy.slice()

	const specificCost = cost.filter((item) => item !== 'any')
	const anyCost = cost.filter((item) => item === 'any')
	const hasEnoughSpecific = specificCost.every((costItem) => {
		// First try find the exact card
		let index = remainingEnergy.findIndex((energyItem) => energyItem === costItem)
		if (index === -1) {
			// Then try find an "any" card
			index = remainingEnergy.findIndex((energyItem) => energyItem === 'any')
			if (index === -1) return
		}
		remainingEnergy.splice(index, 1)
		return true
	})
	if (!hasEnoughSpecific) return false

	// check if remaining energy is enough to cover required "any" cost
	return remainingEnergy.length >= anyCost.length
}

/**
 * Returns true if the attack is targeting the card / row position
 */
export function isTargetingPos(attack: AttackModel, pos: CardPosModel | RowPos): boolean {
	const target = attack.getTarget()
	if (!target) return false
	const targetingPlayer = target.player.id === pos.player.id
	const targetingRow = target.rowIndex === pos.rowIndex

	return targetingPlayer && targetingRow
}

function createWeaknessAttack(attack: AttackModel): AttackModel | null {
	if (attack.createWeakness === 'never') return null
	if (attack.getDamage() * attack.getDamageMultiplier() === 0) return null

	const attacker = attack.getAttacker()
	const target = attack.getTarget()
	const attackId = attack.id

	if (!attacker || !target || !attackId) return null

	const attackerCardInfo = HERMIT_CARDS[attacker.row.hermitCard.cardId]
	const targetCardInfo = HERMIT_CARDS[target.row.hermitCard.cardId]

	if (!attackerCardInfo || !targetCardInfo) return null

	const strength = STRENGTHS[attackerCardInfo.hermitType]
	if (attack.createWeakness !== 'always' && !strength.includes(targetCardInfo.hermitType)) {
		return null
	}

	const weaknessAttack = new AttackModel({
		id: attackId + 'weakness',
		attacker,
		target,
		type: 'weakness',
	})

	weaknessAttack.addDamage(attackerCardInfo.id, WEAKNESS_DAMAGE)

	return weaknessAttack
}
