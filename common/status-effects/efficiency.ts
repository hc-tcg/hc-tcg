import {PlayerComponent} from '../components'
import {onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

const EfficiencyEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	name: 'Efficiency',
	id: 'efficiency',
	icon: 'efficiency',
	description:
		'You may use attacks on this turn without having the necessary item cards attached.',
	applyCondition: (_game, value) =>
		value instanceof PlayerComponent &&
		!value.hasStatusEffect(EfficiencyEffect),
	onApply(_game, effect, player, observer) {
		observer.subscribe(player.hooks.availableEnergy, (_availableEnergy) => {
			// Unliimited powwa
			return ['any', 'any', 'any', 'any']
		})

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default EfficiencyEffect
