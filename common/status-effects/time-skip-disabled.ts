import {PlayerComponent} from '../components'
import {onTurnEnd} from '../types/priorities'
import {Counter, systemStatusEffect} from './status-effect'

const TimeSkipDisabledEffect: Counter<PlayerComponent> = {
	...systemStatusEffect,
	id: 'time-skip-disabled',
	icon: 'time-skip-disabled',
	counter: 1,
	counterType: 'turns',
	name: 'Time Skip Disabled',
	description: 'The attack "Time Skip" is disabled this turn.',
	onApply(_game, effect, player, observer) {
		if (effect.counter === null) effect.counter = this.counter

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (effect.counter === null) return
				if (effect.counter === 0) effect.remove()
				effect.counter--
			},
		)
	},
}

export default TimeSkipDisabledEffect
