import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {RowEntity} from '../entities'
import {AttackModel} from '../models/attack-model'
import {GameModel} from '../models/game-model'
import {afterAttack, onTurnEnd} from '../types/priorities'
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

		observer.subscribeWithPriority(
			game.globalHooks.afterAttack,
			afterAttack.TRIGGER_GAS_LIGHT,
			(attack) => {
				if (!attack.isTargeting(target)) return
				if (attack.calculateDamage() === 0) return

				// We have an extra take because status effects are executed at the end of the turn.
				if (attack.type === 'status-effect' && target.slot.inRow()) {
					const attack = newGasLightAttack(game, effect, target.slot.row.entity)
					effect.remove()
					executeExtraAttacks(game, [attack])
					return
				}

				game.components
					.new(
						StatusEffectComponent,
						GasLightTriggeredEffect,
						effect.creator.entity,
					)
					.apply(target.entity)
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
	},
}
