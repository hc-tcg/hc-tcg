import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterAttack, onTurnEnd} from '../types/priorities'
import {executeExtraAttacks} from '../utils/attacks'
import {StatusEffect, damageEffect} from './status-effect'

const PoisonEffect: StatusEffect<CardComponent> = {
	...damageEffect,
	id: 'poison',
	icon: 'poison',
	name: 'Poison',
	description:
		"Poisoned Hermits take an additional 20hp damage at the end of their opponent's turn, until down to 10hp. Can not stack with burn. Ignores damage reduction.",
	applyLog: (values) => `${values.target} was $ePoisoned$`,
	onApply(
		game: GameModel,
		effect: StatusEffectComponent,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer} = target

		observer.subscribeWithPriority(
			opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.BEFORE_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!target.slot.inRow()) return
				const statusEffectAttack = game.newAttack({
					attacker: effect.entity,
					target: target.slot.row.entity,
					player: opponentPlayer.entity,
					type: 'status-effect',
					trueDamage: true,
					log: (values) =>
						`${values.target} took ${values.damage} damage from $bPoison$`,
				})

				let damage = 0
				if (target.slot.row.health && target.slot.row.health >= 30) {
					damage = 20
				} else if (target.slot.row.health && target.slot.row.health > 10) {
					damage = target.slot.row.health - 10
				}
				statusEffectAttack.addDamage(effect.entity, damage)

				executeExtraAttacks(game, [statusEffectAttack])
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

export default PoisonEffect
