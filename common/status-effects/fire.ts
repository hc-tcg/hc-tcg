import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterAttack, onTurnEnd} from '../types/priorities'
import {executeExtraAttacks} from '../utils/attacks'
import {StatusEffect, damageEffect} from './status-effect'

const FireEffect: StatusEffect<CardComponent> = {
	...damageEffect,
	id: 'fire',
	icon: 'fire',
	name: 'Burn',
	description:
		"Burned Hermits take an additional 20hp damage at the end of their opponent's turn, until knocked out. Can not stack with poison.",
	applyLog: (values) => `${values.target} was $eBurned$`,
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
					log: (values) =>
						`${values.target} took ${values.damage} damage from $bBurn$`,
				})
				statusEffectAttack.addDamage(target.entity, 20)

				executeExtraAttacks(game, [statusEffectAttack])
			},
		)

		observer.subscribeWithPriority(
			game.globalHooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(_attack) => {
				if (!target.isAlive()) effect.remove()
			},
		)
	},
}

export default FireEffect
