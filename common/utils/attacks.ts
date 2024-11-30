import {Hermit} from '../cards/types'
import {CardComponent, ObserverComponent} from '../components'
import query from '../components/query'
import {WEAKNESS_DAMAGE} from '../const/damage'
import {STRENGTHS} from '../const/strengths'
import {AttackModel} from '../models/attack-model'
import {GameModel} from '../models/game-model'
import {TypeT} from '../types/cards'
import {afterAttack, onTurnEnd} from '../types/priorities'

/**
 * Call before attack hooks for each attack that has an attacker
 */
function runBeforeAttackHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let attackIndex = 0; attackIndex < attacks.length; attackIndex++) {
		const attack = attacks[attackIndex]
		if (!attack.attacker) return

		if (game.settings.disableDamage) {
			attack.multiplyDamage('debug', 0).lockDamage('debug')
		}

		// Call before attack hooks
		game.hooks.beforeAttack.callSome([attack], (observer) => {
			let entity = game.components.get(
				game.components.get(observer)?.wrappingEntity || null,
			)
			if (entity instanceof CardComponent)
				return !shouldIgnoreCard(attack, game, entity)
			return true
		})
	}
}

function runRowReviveHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]

		// Call after attack hooks
		game.hooks.rowRevive.callSome([attack], (observer) => {
			let entity = game.components.get(
				game.components.get(observer)?.wrappingEntity || null,
			)
			if (entity instanceof CardComponent)
				return !shouldIgnoreCard(attack, game, entity)
			return true
		})
	}
}

function runAfterAttackHooks(game: GameModel, attacks: Array<AttackModel>) {
	for (let i = 0; i < attacks.length; i++) {
		const attack = attacks[i]

		// Call after attack hooks
		game.hooks.afterAttack.callSome([attack], (observer) => {
			let entity = game.components.get(
				game.components.get(observer)?.wrappingEntity || null,
			)
			if (entity instanceof CardComponent)
				return !shouldIgnoreCard(attack, game, entity)
			return true
		})
	}
}

function shouldIgnoreCard(
	attack: AttackModel,
	game: GameModel,
	instance: CardComponent,
): boolean {
	if (!instance.slot) return false
	if (query.some(...attack.shouldIgnoreCards)(game, instance)) {
		return true
	}

	return false
}

/** Executes a complete attack cycle (without creating attack logs) */
export function executeAttacks(game: GameModel, attacks: Array<AttackModel>) {
	const allAttacks: Array<AttackModel> = []

	while (attacks.length > 0) {
		// STEP 1 - Call before attack and defence for all attacks
		runBeforeAttackHooks(game, attacks)

		const nextAttacks: Array<AttackModel> = []
		// STEP 3 - Execute all attacks
		attacks.forEach((attack) => {
			attack.target?.damage(attack.calculateDamage())
			let weaknessAttack = createWeaknessAttack(game, attack)
			if (weaknessAttack) attack.addNewAttack(weaknessAttack)

			if (attack.nextAttacks.length > 0) {
				nextAttacks.push(...attack.nextAttacks)
			}
		})
		allAttacks.push(...attacks)
		attacks = nextAttacks
	}

	// STEP 6 - After all attacks have been executed, call after attack hooks
	runRowReviveHooks(game, allAttacks)
	runAfterAttackHooks(game, allAttacks)
}

/** Executes a complete attack cycle and automatically sends attack logs */
export function executeExtraAttacks(
	game: GameModel,
	attacks: Array<AttackModel>,
) {
	executeAttacks(game, attacks)

	attacks.forEach((attack) => {
		game.battleLog.addAttackEntry(attack, game.currentPlayer.coinFlips, null)
	})

	game.battleLog.sendLogs()
}

export function getRemainingEnergy(
	energy: Array<TypeT>,
	cost: Array<TypeT>,
): Array<TypeT> | 'not-enough-energy' {
	let remainingTypedEnergy = energy.filter((item) => item !== 'any')
	let remainingWildEnergy = energy.filter((item) => item === 'any')

	const specificCost: Array<TypeT> = cost.filter((item) => item !== 'any')
	const anyCost: Array<TypeT> = cost.filter((item) => item === 'any')

	remainingTypedEnergy = remainingTypedEnergy.filter((e) => {
		let specificIndex = specificCost.indexOf(e)
		if (specificIndex > -1) {
			specificCost.splice(specificIndex, 1)
			return false
		}
		if (anyCost.length > 0) {
			anyCost.pop()
			return false
		}
		return true
	})

	remainingWildEnergy = remainingWildEnergy.filter((_e) => {
		if (specificCost.length > 0) {
			specificCost.pop()
			return false
		}
		if (anyCost.length > 0) {
			anyCost.pop()
			return false
		}
		return true
	})

	if (specificCost.length > 0 || anyCost.length > 0) {
		return 'not-enough-energy'
	}

	return [...remainingTypedEnergy, ...remainingWildEnergy]
}

export function hasEnoughEnergy(
	energy: Array<TypeT>,
	cost: Array<TypeT>,
	noItemRequirements: boolean,
) {
	if (noItemRequirements) return true
	return getRemainingEnergy(energy, cost) !== 'not-enough-energy'
}

function createWeaknessAttack(
	game: GameModel,
	attack: AttackModel,
): AttackModel | null {
	if (attack.createWeakness === 'never') return null
	// Only hermit attacks have extra weakness damage.
	if (!['primary', 'secondary'].includes(attack.type)) return null
	if (attack.getDamage() * attack.getDamageMultiplier() === 0) return null

	let attacker = attack.attacker
	if (!(attacker instanceof CardComponent)) return null

	const targetCardInfo = game.components.find(
		CardComponent,
		query.card.rowEntity(attack.targetEntity),
		query.card.isHermit,
	)

	if (!attacker.isHermit() || !targetCardInfo?.isHermit()) return null

	const strength = STRENGTHS[attacker.props.type]
	if (
		attack.createWeakness !== 'always' &&
		!strength.includes(targetCardInfo.props.type)
	) {
		return null
	}

	const weaknessAttack = game.newAttack({
		attacker: attacker.entity,
		target: attack.targetEntity,
		shouldIgnoreSlots: attack.shouldIgnoreCards,
		type: 'weakness',
	})

	weaknessAttack.addDamage(attacker.entity, WEAKNESS_DAMAGE)

	return weaknessAttack
}

export type MockedAttack = {
	hermitName: string
	attackName: string
	getAttack: () => AttackModel | null
}

/** Create a card that is able to mock a single attack. Return a function to retrieve said attack. */
export function setupMockCard(
	game: GameModel,
	component: CardComponent,
	mocking: CardComponent<Hermit>,
	attackType: 'primary' | 'secondary',
): MockedAttack {
	const observer = game.components.new(ObserverComponent, component.entity)
	const player = component.player

	mocking.props.onAttach(game, component, observer)

	player.hooks.getAttackRequests.callSome(
		[component, attackType],
		(observerEntity) => observerEntity === observer.entity,
	)
	observer.unsubscribe(player.hooks.getAttackRequests)

	const destroyMockCard = () => {
		mocking.props.onDetach(game, component, observer)
		observer.unsubscribeFromEverything()
	}
	observer.subscribeBefore(player.hooks.getAttackRequests, destroyMockCard)

	observer.subscribeWithPriority(
		player.hooks.onTurnEnd,
		onTurnEnd.DESTROY_MOCK_CARD,
		destroyMockCard,
	)
	observer.subscribeWithPriority(
		game.hooks.afterAttack,
		afterAttack.DESTROY_MOCK_CARD,
		destroyMockCard,
	)

	return {
		hermitName: mocking.props.name,
		attackName:
			attackType === 'primary'
				? mocking.props.primary.name
				: mocking.props.secondary.name,
		getAttack: () => {
			return mocking.props.getAttack(game, component, attackType)
		},
	}
}
