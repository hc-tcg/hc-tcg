import {CardComponent} from '../components'
import query from '../components/query'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const IgnoreAttachSlotEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
	icon: 'ignore-attach',
	id: 'ignore-attach',
	name: 'Ignore Attach Effect',
	description:
		'Any attach effect on this hermit ignores damage for the rest of this turn.',
	applyCondition(_game, value) {
		return (
			value instanceof CardComponent &&
			value.slot.inRow() &&
			value.slot.row.getAttach() !== null &&
			!value.getStatusEffect(IgnoreAttachSlotEffect)
		)
	},
	onApply(game, effect, target, observer) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.IGNORE_CARDS,
			(attack) => {
				if (attack.player.entity !== target.opponentPlayer.entity) return
				if (!target.slot.inRow()) return
				attack.shouldIgnoreCards.push(
					query.card.slot(
						query.every(
							query.slot.attach,
							query.slot.rowIs(target.slot.rowEntity),
						),
					),
				)
			},
		)

		observer.subscribeWithPriority(
			target.opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}
