import {CardComponent} from '../components'
import {hiddenStatusEffect, StatusEffect} from './status-effect'

const TFCDiscardedFromEffect: StatusEffect<CardComponent> = {
	...hiddenStatusEffect,
	id: 'tfc-discarded-from',
	onApply(_game, effect, target, observer) {
		observer.subscribe(effect.creator.player.hooks.onDetach, (instance) => {
			if (instance.entity === effect.creatorEntity) effect.remove()
		})
		observer.subscribe(target.player.hooks.onDetach, (instance) => {
			if (instance.entity === target.entity) effect.remove()
		})
	},
}

export default TFCDiscardedFromEffect
