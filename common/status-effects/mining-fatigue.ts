import {CardComponent, StatusEffectComponent} from '../components'
import query from '../components/query'
import {Counter, StatusEffect, statusEffect} from './status-effect'

export const MiningFatigueEffect: Counter<CardComponent> = {
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

		observer.subscribe(target.hooks.getPrimaryCost, () => {
			return ['any']
		})

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})
	},
}

export const SingleTurnMiningFatigueEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	id: 'mining-fatigue',
	icon: 'mining-fatigue',
	name: 'Mining Fatigue',
	description:
		"This Hermit's attacks cost an additional item card of their type.",
	onApply(game, effect, target, observer) {
		let components = game.components.filter(
			StatusEffectComponent,
			query.effect.is(SingleTurnMiningFatigueEffect),
			query.effect.targetEntity(target.entity),
		)
		if (components.length >= 2) {
			components[0].remove()
		}

		let counter = 2

		const {player} = target

		if (target.isHermit())
			effect.description = `This Hermit's attacks cost an additional ${target.props.type} item to use.`

		observer.subscribe(player.hooks.onTurnStart, () => {
			counter--
			if (counter === 0) effect.remove()
		})
	},
}
