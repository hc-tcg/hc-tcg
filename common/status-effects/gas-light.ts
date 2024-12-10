import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {RowEntity} from '../entities'
import {AttackModel} from '../models/attack-model'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {executeExtraAttacks} from '../utils/attacks'
import {
	StatusEffect,
	hiddenStatusEffect,
	systemStatusEffect,
} from './status-effect'

function newGasLightAttack(
	game: GameModel,
	effect: StatusEffectComponent,
	target: RowEntity,
): AttackModel {
	return game
		.newAttack({
			attacker: effect.creator.entity,
			target: target,
			type: 'secondary',
			shouldIgnoreSlots: [query.card.entity(effect.creator.entity)],
			log: (values) =>
				`${values.target} took ${values.damage} damage from $vGas Light$`,
		})
		.addDamage(effect.entity, 20)
		.multiplyDamage(effect.entity, effect.counter || 0)
}

export function isFromGasLightEffect(
	game: GameModel,
	attack: AttackModel,
): boolean {
	const damageSource = attack.getHistory('add_damage').at(0)?.source
	if (damageSource === undefined || damageSource === 'debug') return false
	const component = game.components.get(damageSource)
	if (!component || component instanceof CardComponent) return false
	return query.effect.is(GasLightTriggeredEffect, GasLightEffect)(
		game,
		component,
	)
}

export const GasLightEffect: StatusEffect<CardComponent> = {
	...hiddenStatusEffect,
	id: 'gas-light',
	name: 'Gas Light Applied',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		let {opponentPlayer} = target

		if (effect.counter === null) effect.counter = 1
		let predecessor = game.components.find(
			StatusEffectComponent,
			query.effect.is(GasLightEffect, GasLightTriggeredEffect),
			query.effect.targetEntity(target.entity),
			(_game, value) => value.entity !== effect.entity,
		)
		if (predecessor) {
			if (predecessor.counter !== null) predecessor.counter++
			effect.remove()
			return
		}
		predecessor = game.components.find(
			StatusEffectComponent,
			query.effect.is(GasLightPotentialEffect),
			query.effect.targetEntity(target.entity),
		)
		if (predecessor) {
			if (predecessor.counter === 1) {
				game.components
					.new(
						StatusEffectComponent,
						GasLightTriggeredEffect,
						effect.creator.entity,
					)
					.apply(target.entity)
				effect.remove()
				predecessor.remove()
				return
			}
			predecessor.remove()
		}

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			(attack) => {
				if (!attack.isTargeting(target)) return
				if (attack.calculateDamage() === 0) return

				// We have an extra take because status effects are executed at the end of the turn.
				if (attack.type === 'status-effect' && target.slot.inRow()) {
					const newAttack = newGasLightAttack(
						game,
						effect,
						target.slot.row.entity,
					)
					effect.remove()
					attack.addNewAttack(newAttack)
					return
				}

				const triggered = game.components.new(
					StatusEffectComponent,
					GasLightTriggeredEffect,
					effect.creator.entity,
				)
				triggered.apply(target.entity)
				triggered.counter = effect.counter
				effect.remove()
			},
		)

		observer.subscribeWithPriority(
			opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export const GasLightTriggeredEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'gas-light-triggered',
	icon: 'gas-light',
	name: 'Gas Light',
	description: 'This hermit will take 20 damage at the end of your turn.',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		let {opponentPlayer} = target

		if (effect.counter === null) effect.counter = 1

		observer.subscribeWithPriority(
			opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!target.slot.inRow()) return
				executeExtraAttacks(game, [
					newGasLightAttack(game, effect, target.slot.row.entity),
				])
				effect.remove()
			},
		)

		// Prevents Gas Light from knocking out a hermit that gets revived by Totem after taking Burn damage
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			(attack) => {
				if (attack.isType('status-effect') && attack.isTargeting(target)) {
					attack.addNewAttack(
						newGasLightAttack(game, effect, attack.target!.entity),
					)
					effect.remove()
				}
			},
		)
	},
}

export const GasLightPotentialEffect: StatusEffect<CardComponent> = {
	...hiddenStatusEffect,
	id: 'gas-light-potential',
	applyCondition: (_game, value) =>
		value instanceof CardComponent &&
		!value.getStatusEffect(
			GasLightPotentialEffect,
			GasLightEffect,
			GasLightTriggeredEffect,
		),
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		let {opponentPlayer} = target

		if (effect.counter === null) effect.counter = 0

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			(attack) => {
				if (!attack.isTargeting(target)) return
				if (attack.calculateDamage() === 0) return

				effect.counter = 1
			},
		)

		observer.subscribeWithPriority(
			opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}
