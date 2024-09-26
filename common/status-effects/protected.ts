import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {afterDefence, beforeDefence, onTurnEnd} from '../types/priorities'
import {StatusEffect, statusEffect} from './status-effect'

const ProtectedEffect: StatusEffect<CardComponent> = {
	...statusEffect,
	id: 'protected',
	icon: 'protected',
	name: "Sheriff's Protection",
	description:
		'This Hermit does not take damage on their first active turn.\nOnly one Hermit can be protected at a time.',
	applyCondition: (_game, target) => {
		return (
			target instanceof CardComponent &&
			!target.getStatusEffect(ProtectedEffect)
		)
	},
	applyLog: (values) =>
		`${values.target} ${values.verb} selected for ${values.statusEffect}`,
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target
		game.components
			.filter(
				StatusEffectComponent,
				query.effect.is(ProtectedEffect),
				query.effect.targetIsCardAnd(
					query.card.player(player.entity),
					query.not(query.card.entity(target.entity)),
				),
			)
			.forEach((effect) => effect.remove())

		let becameActive = false

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				if (
					target.slot.inRow() &&
					player.activeRowEntity === target.slot.rowEntity
				) {
					becameActive = true
				}
			},
		)

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (becameActive) {
				effect.remove()
			}
		})

		observer.subscribeWithPriority(
			player.hooks.beforeDefence,
			beforeDefence.HERMIT_BLOCK_DAMAGE,
			(attack) => {
				if (!becameActive || !attack.isTargeting(target)) return
				// Do not block backlash attacks
				if (attack.isBacklash) return

				if (attack.getDamage() > 0) {
					// Block all damage
					attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
				}
			},
		)

		observer.subscribeWithPriority(
			player.hooks.afterDefence,
			afterDefence.ON_ROW_DEATH,
			(attack) => {
				if (!attack.isTargeting(target) || attack.target?.health) return
				effect.remove()
			},
		)
	},
}

export default ProtectedEffect
