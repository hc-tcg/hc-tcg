import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {executeExtraAttacks} from '../utils/attacks'
import {
	CardStatusEffect,
	StatusEffectProps,
	damageEffect,
} from './status-effect'

class FireEffect extends CardStatusEffect {
	props: StatusEffectProps = {
		...damageEffect,
		icon: 'fire',
		name: 'Burn',
		description:
			"Burned Hermits take an additional 20hp damage at the end of their opponent's turn, until knocked out. Can not stack with poison.",
		applyLog: (values) => `${values.target} was $eBurned$`,
	}

	override onApply(
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

		observer.subscribe(player.hooks.afterDefence, (_attack) => {
			if (!target.isAlive()) effect.remove()
		})
	}
}

export default FireEffect
