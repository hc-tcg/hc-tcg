import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import query from '../components/query'
import {GameModel} from '../models/game-model'
import {afterAttack, beforeAttack, onTurnEnd} from '../types/priorities'
import {StatusEffect, systemStatusEffect} from './status-effect'

const ProtectedEffect: StatusEffect<CardComponent> = {
	...systemStatusEffect,
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
		`${values.target} was selected for ${values.statusEffect}`,
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

		/** Keeps track of whether Sheriff's Protection is protecting its row and if it should timeout */
		let state: 'activated' | 'defend-then-timeout' | 'inactive' = 'inactive'

		observer.subscribe(
			player.hooks.onActiveRowChange,
			(oldActiveHermit, newActiveHermit) => {
				if (newActiveHermit.entity === target.entity) {
					if (state !== 'defend-then-timeout') {
						if (state === 'inactive') {
							game.battleLog.addEntry(
								player.entity,
								`$p${target.props.name}$ is now protected by the Sheriff`,
							)
						}
						state = 'activated'
					}
				} else if (
					oldActiveHermit?.entity === target.entity &&
					state !== 'defend-then-timeout'
				) {
					if (target.slot.inRow() && state !== 'inactive') {
						game.battleLog.addEntry(
							player.entity,
							`$p${target.props.name} (${target.slot.row.index + 1})$ is no longer protected by the Sheriff`,
						)
					}
					state = 'inactive'
				}
			},
		)

		observer.subscribeWithPriority(
			player.opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (state === 'defend-then-timeout') {
					if (target.slot.inRow()) {
						game.battleLog.addEntry(
							player.entity,
							`$e${ProtectedEffect.name}$ has ran out for $p${target.props.name} (${target.slot.row.index + 1})$`,
						)
					}
					effect.remove()
				}
			},
		)

		observer.subscribe(player.opponentPlayer.hooks.onTurnStart, () => {
			if (state === 'activated') {
				state = 'defend-then-timeout'
			}
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_BLOCK_DAMAGE,
			(attack) => {
				if (state === 'inactive' || !attack.isTargeting(target)) return
				// Do not block backlash attacks
				if (attack.isBacklash) return

				if (attack.getDamage() > 0) {
					// Block all damage
					attack.multiplyDamage(effect.entity, 0).lockDamage(effect.entity)
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!attack.isTargeting(target) || attack.target?.health) return
				effect.remove()
			},
		)
	},
}

export default ProtectedEffect
