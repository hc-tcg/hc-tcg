import {PlayerComponent} from '../components'
import {afterAttack, onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

const EfficiencyEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	name: 'Efficiency',
	id: 'efficiency',
	icon: 'efficiency',
	description:
		'You may use attacks on this turn without having the necessary item cards attached.',
	onApply(game, effect, player, observer) {
		observer.subscribe(player.hooks.availableEnergy, (_availableEnergy) => {
			// Unliimited powwa
			return ['any', 'any', 'any', 'any']
		})

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				effect.remove()
			},
		)

		// In case the player does not attack
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
