import StatusEffect, {StatusEffectProps, damageEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {executeExtraAttacks} from '../utils/attacks'
import {CardComponent, StatusEffectComponent} from '../components'

class FireStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...damageEffect,
		id: 'fire',
		name: 'Burn',
		description:
			"Burned Hermits take an additional 20hp damage at the end of their opponent's turn, until knocked out. Can not stack with poison.",
		applyLog: (values) => `${values.target} was $eBurned$`,
	}

	override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player, opponentPlayer} = target

		opponentPlayer.hooks.onTurnEnd.add(effect, () => {
			if (!target.slot.inRow()) return
			const statusEffectAttack = game.newAttack({
				attacker: effect.entity,
				target: target.slot.row.entity,
				type: 'status-effect',
				log: (values) => `${values.target} took ${values.damage} damage from $bBurn$`,
			})
			statusEffectAttack.addDamage(target.entity, 20)

			executeExtraAttacks(game, [statusEffectAttack], true)
		})

		player.hooks.afterDefence.add(effect, (_attack) => {
			if (!target.isAlive()) effect.remove()
		})
	}

	override onRemoval(_game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player, opponentPlayer} = target
		opponentPlayer.hooks.onTurnEnd.remove(effect)
		player.hooks.afterDefence.remove(effect)
	}
}

export default FireStatusEffect
