import {CardComponent} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {beforeAttack} from '../types/priorities'
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
			!value.getStatusEffect(IgnoreAttachSlotEffect)
		)
	},
	onApply(game: GameModel, effect, target, observer) {
		const {currentPlayer} = game

		observer.subscribeWithPriority(
			currentPlayer.hooks.beforeAttack,
			beforeAttack.IGNORE_CARDS,
			(attack) => {
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

		observer.subscribe(currentPlayer.hooks.onTurnEnd, () => {
			effect.remove()
		})
	},
}
