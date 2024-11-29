import {CardComponent} from '../components'
import {onTurnEnd} from '../types/priorities'
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

		if (target.isHermit()) {
			effect.description = `This Hermit's attacks cost an additional ${target.props.type} item to use.`
			observer.subscribe(target.hooks.getPrimaryCost, () => {
				return [target.props.type]
			})
			observer.subscribe(target.hooks.getSecondaryCost, () => {
				return [target.props.type]
			})
		}

		observer.subscribe(opponentPlayer.hooks.onTurnStart, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) effect.remove()
		})
	},
}

export const SingleTurnMiningFatigueEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	id: 'single-turn-mining-fatigue',
	icon: 'mining-fatigue',
	name: 'Mining Fatigue',
	description:
		"This Hermit's attacks cost an additional item card of their type.",
	counter: 2,
	applyCondition(_game, value) {
		return (
			value instanceof CardComponent &&
			value.getStatusEffect(SingleTurnMiningFatigueEffect)?.counter !== 2
		)
	},
	onApply(_game, effect, target, observer) {
		const {player} = target

		if (target.isHermit()) {
			effect.description = `This Hermit's attacks cost an additional ${target.props.type} item to use.`
			observer.subscribe(target.hooks.getPrimaryCost, () => {
				return [target.props.type]
			})
			observer.subscribe(target.hooks.getSecondaryCost, () => {
				return [target.props.type]
			})
		}

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!effect.counter) return

				effect.counter--
				if (effect.counter === 0) {
					effect.remove()
					return
				}
			},
		)
	},
}
