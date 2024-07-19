import {Counter, PlayerStatusEffect, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {ObserverComponent, PlayerComponent, StatusEffectComponent} from '../components'
import JoeHillsRare from '../cards/default/hermits/joehills-rare'

class UsedClockEffect extends PlayerStatusEffect {
	props: StatusEffectProps & Counter = {
		...systemStatusEffect,
		id: 'used-clock',
		name: 'Clocked Out',
		description: "Your opponent's turns cannot be skipped consecutively.",
		counter: 1,
		counterType: 'turns',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent
	) {
		if (effect.counter === null) effect.counter = this.props.counter

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (effect.counter === null) return
			if (effect.counter === 0) effect.remove()
			effect.counter--
		})
	}
}

export default UsedClockEffect
