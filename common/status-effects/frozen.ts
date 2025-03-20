import {
	CardComponent,
	PlayerComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {afterAttack, beforeAttack} from '../types/priorities'
import {StatusEffect, statusEffect} from './status-effect'

const hasNotFrozenHermit = (player: PlayerComponent) => [
	query.slot.player(player.entity),
	query.slot.hermit,
	query.not(query.slot.empty),
	query.not(query.slot.hasStatusEffect(FrozenEffect)),
]

const FrozenEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	name: 'Frozen',
	icon: 'frozen',
	id: 'frozen',
	description:
		"This Hermit cannot become active. Frozen Hermits cannot take damage. If all of a player's Hermits are Frozen, frozen is removed.",
	applyLog: (values) => `${values.target} was $eFrozen$`,
	removeLog: (values) => `${values.statusEffect} on ${values.target} wore off`,
	onApply(game, effect, target, observer) {
		const {player} = target

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.EFFECT_BLOCK_DAMAGE,
			(attack) => {
				if (!attack.isTargeting(target) || attack.isType('status-effect'))
					return

				attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (attack.target?.player !== player) return
				if (
					game.components.exists(SlotComponent, ...hasNotFrozenHermit(player))
				)
					return

				game.components
					.filter(
						StatusEffectComponent,
						query.effect.is(FrozenEffect),
						query.effect.targetIsCardAnd(query.card.player(player.entity)),
					)
					.forEach((effect) => effect.remove())
			},
		)

		observer.subscribe(
			player.hooks.beforeActiveRowChange,
			(_oldHermit, newHermit) => {
				return (
					newHermit.entity !== target.entity ||
					!game.components.exists(SlotComponent, ...hasNotFrozenHermit(player))
				)
			},
		)
	},
}

export default FrozenEffect
