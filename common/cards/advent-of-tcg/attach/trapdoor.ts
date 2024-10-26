import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {
	GasLightEffect,
	GasLightTriggeredEffect,
} from '../../../status-effects/gas-light'
import {TargetBlockEffect} from '../../../status-effects/target-block'
import {afterAttack, beforeAttack} from '../../../types/priorities'
import LightningRod from '../../alter-egos/effects/lightning-rod'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

function isFromGasLightEffect(game: GameModel, attack: AttackModel): boolean {
	const damageSource = attack.getHistory('add_damage').at(0)?.source
	if (damageSource === undefined) return false
	const component: CardComponent | StatusEffectComponent | null =
		game.components.get((damageSource as any) || null)
	if (!component || component instanceof CardComponent) return false
	return query.effect.is(GasLightTriggeredEffect, GasLightEffect)(
		game,
		component,
	)
}

const Trapdoor: Attach = {
	...attach,
	id: 'trapdoor',
	numericId: 205,
	name: 'Trapdoor',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	description:
		"When an adjacent Hermit takes damage from an opponent's attack, up to 40hp damage is taken by this Hermit instead.",
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let totalReduction = 0

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.TRAPDOOR_INTERCEPT_DAMAGE,
			(attack) => {
				const target = attack.target
				if (
					target?.player.entity !== player.entity ||
					!(attack.attacker instanceof CardComponent) ||
					attack.attacker.player.entity !== opponentPlayer.entity
				)
					return
				if (attack.isType('status-effect') || attack.isBacklash) return
				if (!component.slot.inRow()) return
				if (
					!query.row.adjacent(query.row.entity(component.slot.rowEntity))(
						game,
						target,
					)
				)
					return
				const targetHermit = target.getHermit()
				if (!targetHermit) return
				// Target Block cannot be ignored so don't try intercepting damage for log clarity
				if (targetHermit.getStatusEffect(TargetBlockEffect)) return

				if (isFromGasLightEffect(game, attack)) return

				if (totalReduction < 40) {
					const damageReduction = Math.min(
						attack.calculateDamage(),
						40 - totalReduction,
					)
					totalReduction += damageReduction
					attack.addDamageReduction(component.entity, damageReduction)

					const newAttack = game
						.newAttack({
							attacker: attack.attacker.entity,
							target: component.slot.rowEntity,
							type: attack.type,
							log: (values) =>
								values.attack.getDamageMultiplier()
									? ` (${values.damage} was intercepted by ${values.target} with $eTrapdoor$)`
									: ` ($b${damageReduction}hp$ was blocked by ${values.target} with $eTrapdoor$)`,
						})
						.addDamage(component.entity, damageReduction)
					// newAttack should not run extra hooks for attacker, or be redirected back to the original target
					newAttack.shouldIgnoreCards.push(
						...attack.shouldIgnoreCards,
						query.card.entity(attack.attacker.entity),
						query.every(
							query.card.rowEntity(attack.targetEntity),
							query.card.is(Trapdoor, LightningRod),
						),
					)
					attack.nextAttacks.unshift(newAttack)
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				totalReduction = 0
			},
		)
	},
}

export default Trapdoor
