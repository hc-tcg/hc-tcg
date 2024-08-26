import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {RowEntity} from '../entities'
import {GameModel} from '../models/game-model'
import {AttackDefs} from '../types/attack'
import {executeExtraAttacks} from '../utils/attacks'
import {
	StatusEffect,
	hiddenStatusEffect,
	systemStatusEffect,
} from './status-effect'

function newGasLightAttack(
	effect: StatusEffectComponent,
	target: RowEntity,
): AttackDefs {
	return {
		attacker: effect.entity,
		target: target,
		type: 'status-effect',
		player: effect.target.opponentPlayer.entity,
		log: (values) =>
			`${values.target} took ${values.damage} damage from $vGas Light$`,
	} satisfies AttackDefs
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
		let {player, opponentPlayer} = target

		observer.subscribe(player.hooks.afterDefence, (attack) => {
			if (!attack.isTargeting(target)) return
			if (attack.calculateDamage() === 0) return

			// We have an extra take because status effects are executed at the end of the turn.
			if (attack.type === 'status-effect' && target.slot.inRow()) {
				let attack = game
					.newAttack(newGasLightAttack(effect, target.slot.row.entity))
					.addDamage(effect.entity, 20)
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
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
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

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			if (!target.slot.inRow()) return
			let attack = game
				.newAttack(newGasLightAttack(effect, target.slot.row.entity))
				.addDamage(effect.entity, 20)
			executeExtraAttacks(game, [attack])
			effect.remove()
		})
	},
}
