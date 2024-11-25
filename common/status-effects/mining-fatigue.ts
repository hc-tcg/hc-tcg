import {CardComponent} from '../components'
import {Counter, statusEffect} from './status-effect'

const MiningFatigueEffect: Counter<CardComponent> = {
	...statusEffect,
	id: 'mining-fatigue',
	icon: 'mining-fatigue',
	name: 'Mining Fatigue',
	description:
		"This Hermit's attacks cost an additional item card of their type.",
	counter: 3,
	counterType: 'turns',
	onApply(_game, effect, target, observer) {
		const {opponentPlayer} = target

		if (target.isHermit())
			effect.description = `This Hermit's attacks cost an additional ${target.props.type} item to use.`

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})
	},
}

export default MiningFatigueEffect
