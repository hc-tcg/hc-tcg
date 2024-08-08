import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	Counter,
	PlayerStatusEffect,
	StatusEffect,
	systemStatusEffect,
} from './status-effect'

class UsedClockEffect extends PlayerStatusEffect {
	props: StatusEffect & Counter = {
		...systemStatusEffect,
		icon: 'used-clock',
		name: 'Clocked Out',
		description: "Your opponent's turns cannot be skipped consecutively.",
		counter: 1,
		counterType: 'turns',
	}

	override onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		player: PlayerComponent,
		observer: ObserverComponent,
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
