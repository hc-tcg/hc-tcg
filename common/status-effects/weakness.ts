import {PlayerStatusEffect, Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../components'

export class WeakToBalancedEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		icon: 'weak',
		name: 'Modified Weakness',
		description: 'This hermit has modified weakness to Balanced type Hermits.',
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

		observer.subscribe(player.hooks.beforeDefence, (attack) => {
			if (!target.slot.inRow()) return
			if (attack.targetEntity !== target.slot.rowEntity || attack.createWeakness === 'never') return
			attack.createWeakness = 'always'
		})
	}
}
