import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	CardStatusEffect,
	Counter,
	StatusEffect,
	statusEffect,
} from './status-effect'

class WeaknessEffect extends CardStatusEffect {
	props: StatusEffect & Counter = {
		...statusEffect,
		icon: 'weakness',
		name: 'Weakness',
		description: "This Hermit is weak to the opponent's active Hermit's type.",
		counter: 3,
		counterType: 'turns',
	}

	public override onApply(
		_game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		if (!effect.counter) effect.counter = this.props.counter

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})

		observer.subscribe(player.hooks.beforeDefence, (attack) => {
			if (!target.slot.inRow()) return
			if (
				attack.targetEntity !== target.slot.rowEntity ||
				attack.createWeakness === 'never'
			)
				return
			attack.createWeakness = 'always'
		})
	}
}

export default WeaknessEffect
