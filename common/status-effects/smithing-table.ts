import {CardComponent} from '../components'
import query from '../components/query'
import {StatusEffect, systemStatusEffect} from './status-effect'

const SmithingTableEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	id: 'smithing-table',
	icon: 'smithing-table',
	name: 'Reinforced',
	description:
		'This card cannot be removed from this slot until this row is knocked out or it discards itself.',
	onApply(game, _effect, target, observer) {
		observer.subscribe(game.hooks.freezeSlots, () => {
			if (target.slot.onBoard()) {
				return query.slot.entity(target.slot.entity)
			}
			return query.nothing
		})
	},
	onRemoval(_game, effect, target, observer) {
		observer.subscribe(target.hooks.onChangeSlot, () => {
			observer.unsubscribe(target.hooks.onChangeSlot)
			effect.apply(target.entity)
		})
	},
}

export default SmithingTableEffect
