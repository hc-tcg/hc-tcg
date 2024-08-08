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

class SlownessEffect extends CardStatusEffect {
	props: StatusEffect & Counter = {
		...statusEffect,
		icon: 'slowness',
		name: 'Slowness',
		description: 'This Hermit can only use their primary attack.',
		counter: 1,
		counterType: 'turns',
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		if (!effect.counter) effect.counter = this.props.counter

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (
				target.slot?.onBoard() &&
				player.activeRowEntity === target.slot.row?.entity
			)
				game.addBlockedActions(this.props.icon, 'SECONDARY_ATTACK')
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) {
				effect.remove()
				return
			}
		})

		observer.subscribe(player.hooks.afterDefence, (attack) => {
			if (
				!target.slot?.onBoard() ||
				attack.target?.entity !== target.slot.row?.entity
			)
				return
			if (target.slot.row?.health) return
			effect.remove()
		})
	}
}

export default SlownessEffect
