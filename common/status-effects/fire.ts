import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterDefence} from '../types/priorities'
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
		const {player, opponentPlayer} = target

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
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
		})

		observer.subscribeWith(
			player.hooks.afterDefence,
			afterDefence.ON_ROW_DEATH,
			(_attack) => {
				if (!target.isAlive()) effect.remove()
			},
		)
	},
}

export default FireEffect
