import MilkBucket from '../cards/attach/milk-bucket'
import {
	CardComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import PoisonEffect from './poison'
import {StatusEffect, systemStatusEffect} from './status-effect'

const PoisonQuiverEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	name: 'Poison Quiver',
	icon: 'poison-quiver',
	id: 'poison-quiver',
	description:
		"Your opponent's AFK Hermits will be poisoned if they take damage this turn.",
	applyCondition: (_game, value) =>
		value instanceof PlayerComponent &&
		!value.hasStatusEffect(PoisonQuiverEffect),
	onApply(game, effect, player, observer) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			(attack) => {
				if (!attack.target || attack.target.player !== player.opponentPlayer)
					return
				if (attack.target.entity === player.opponentPlayer.activeRowEntity)
					return
				if (attack.calculateDamage() <= 0) return

				if (
					game.components.exists(
						CardComponent,
						query.card.is(MilkBucket),
						query.card.rowEntity(attack.targetEntity),
						// query.not(query.some(...attack.shouldIgnoreCards)),
					)
				)
					return

				game.components
					.new(StatusEffectComponent, PoisonEffect, effect.creatorEntity)
					.apply(attack.target.getHermit()?.entity)
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default PoisonQuiverEffect
