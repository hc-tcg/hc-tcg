import {CardStatusEffect, Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'

class WeaknessEffect extends CardStatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		icon: 'weakness',
		name: 'Weakness',
		description: "This Hermit is weak to the opponent's active Hermit's type.",
		counter: 3,
		counterType: 'turns',
	}

	public override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent
	) {
		const {player} = target

		if (!effect.counter) effect.counter = this.props.counter

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})

		observer.subscribe(player.hooks.onDefence, (attack) => {
			if (attack.targetEntity !== effect.targetEntity || attack.createWeakness === 'never') {
				return
			}

			attack.createWeakness = 'always'
		})
	}
}

export default WeaknessEffect
