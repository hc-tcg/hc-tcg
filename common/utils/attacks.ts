import {AttackModel} from '../models/attack-model'
import {WEAKNESS_DAMAGE} from '../const/damage'
import {EnergyT} from '../types/cards'
import {DEBUG_CONFIG} from '../config'
import {GameModel} from '../models/game-model'
import {card, effect, query} from '../components/query'
import {STRENGTHS} from '../const/strengths'
import {CardComponent, StatusEffectComponent} from '../components'
import {HermitAttackType} from '../types/attack'
import {Hermit} from '../cards/base/types'

/**
 * Call before attack hooks for each attack that has an attacker
 */
function runBeforeAttackHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.attacker) return

		// The hooks we call are determined by the source of the attack
		const player = attack.player

		if (DEBUG_CONFIG.disableDamage) {
			attack.multiplyDamage('debug', 0).lockDamage('debug')
		}

		// Call before attack hooks
		player.hooks.beforeAttack.callSome([attack], (instance) => {
			if (instance instanceof CardComponent) return !shouldIgnoreCard(attack, game, instance)
			return true
		})
	}
}

/**
 * Call before defence hooks, based on each attack's target
 */
function runBeforeDefenceHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		const target = attack.target
		if (!target) continue

		// The hooks we call are determined by the target of the attack
		const player = target.player

		// Call before defence hooks
		player.hooks.beforeDefence.callSome([attack], (instance) => {
			if (instance instanceof CardComponent) return !shouldIgnoreCard(attack, game, instance)
			return true
		})
	}
}

/**
 * Call attack hooks for each attack that has an attacker
 */
function runOnAttackHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.player

		// Call on attack hooks
		player.hooks.onAttack.callSome([attack], (instance) => {
			if (instance instanceof CardComponent) return !shouldIgnoreCard(attack, game, instance)
			return true
		})
	}
}

/**
 * Call defence hooks, based on each attack's target
 */
function runOnDefenceHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.target) continue

		// The hooks we call are determined by the target of the attack
		const player = attack.target.player

		// Call on defence hooks
		player.hooks.onDefence.callSome([attack], (instance) => {
			if (instance instanceof CardComponent) return !shouldIgnoreCard(attack, game, instance)
			return true
		})
	}
}

function runAfterAttackHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]
		if (!attack.attacker) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.player

		// Call after attack hooks
		player.hooks.afterAttack.callSome([attack], (instance) => {
			if (instance instanceof CardComponent) return !shouldIgnoreCard(attack, game, instance)
			return true
		})
	}
}

function runAfterDefenceHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]
		if (!attack.target) continue

		// The hooks we call are determined by the source of the attack
		const player = attack.target.player

		// Call after attack hooks
		player.hooks.afterDefence.callSome([attack], (instance) => {
			if (instance instanceof CardComponent) return !shouldIgnoreCard(attack, game, instance)
			return true
		})
	}
}

function shouldIgnoreCard(attack: AttackModel, game: GameModel, instance: CardComponent): boolean {
	if (!instance.slot) return false
	if (query.some(...attack.shouldIgnoreCards)(game, instance)) {
		return true
	}

	return false
}

export function executeAttacks(
	game: GameModel,
	attacks: Array<AttackModel>,
	withoutBlockingActions = false
) {
	// STEP 1 - Call before attack and defence for all attacks
	runBeforeAttackHooks(game, attacks)
	runBeforeDefenceHooks(game, attacks)

	// STEP 2 - Call on attack and defence for all attacks
	runOnAttackHooks(game, attacks)
	runOnDefenceHooks(game, attacks)

	// STEP 3 - Execute all attacks
	attacks.forEach((attack) => {
		attack.target?.damage(attack.calculateDamage())

		if (attack.nextAttacks.length > 0) {
			executeAttacks(game, attack.nextAttacks, withoutBlockingActions)
			let weaknessAttack = createWeaknessAttack(game, attack)
			if (weaknessAttack) attack.addNewAttack(weaknessAttack)
			// Only want to block actions after first attack
			withoutBlockingActions = true
		}
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
	runAfterAttackHooks(game, attacks)
	runAfterDefenceHooks(game, attacks)
}

export function executeExtraAttacks(
	game: GameModel,
	attacks: Array<AttackModel>,
	withoutBlockingActions = false
) {
	executeAttacks(game, attacks, withoutBlockingActions)

	attacks.forEach((attack) => {
		game.battleLog.addAttackEntry(attack, game.currentPlayer.coinFlips, null)
	})

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

export function isTargeting() {}

// @todo
function createWeaknessAttack(game: GameModel, attack: AttackModel): AttackModel | null {
	if (attack.createWeakness === 'never') return null
	if (attack.getDamage() * attack.getDamageMultiplier() === 0) return null

	let attacker = attack.attacker
	if (!(attacker instanceof CardComponent)) return null

	const targetCardInfo = game.components.find(
		CardComponent,
		card.rowIs(attack.targetEntity),
		card.isHermit
	)

	if (!attacker.isHermit() || !targetCardInfo?.isHermit()) return null

	const strength = STRENGTHS[attacker.props.type]
	if (attack.createWeakness !== 'always' && !strength.includes(targetCardInfo.props.type)) {
		return null
	}

	const weaknessAttack = game.newAttack({
		attacker: attacker.entity,
		target: attack.targetEntity,
		type: 'weakness',
	})

	weaknessAttack.addDamage(attacker.entity, WEAKNESS_DAMAGE)

	return weaknessAttack
}

/** Create a mocked card that can be used to create a specific specified attack type. */
export function setupMockedCard(
	game: GameModel,
	attackType: HermitAttackType,
	attackFrom: CardComponent<Hermit>,
	as: CardComponent
): CardComponent {
	let mimickCard = game.components.new(
		CardComponent,
		attackFrom.card.props.id,
		as.slot.entity
	) as CardComponent<Hermit>

	game.currentPlayer.hooks.getAttackRequests.call(mimickCard, attackType)

	return mimickCard
}
