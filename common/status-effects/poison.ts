import StatusEffect, {StatusEffectProps, damageEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {executeExtraAttacks} from '../utils/attacks'
import {CardComponent, StatusEffectComponent} from '../components'

class Poison extends StatusEffect {
	props: StatusEffectProps = {
		...damageEffect,
		id: 'poison',
		name: 'Poison',
		description:
			"Poisoned Hermits take an additional 20hp damage at the end of their opponent's turn, until down to 10hp. Can not stack with burn.",
		applyLog: (values) => `${values.target} was $ePoisoned$`,
	}

	override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player, opponentPlayer} = target

		opponentPlayer.hooks.onTurnEnd.add(effect, () => {
			if (!target.slot.inRow()) return
			const statusEffectAttack = game.newAttack({
				attacker: effect.entity,
				target: target.slot.row.entity,
				player: opponentPlayer.entity,
				type: 'status-effect',
				log: (values) => `${values.target} took ${values.damage} damage from $bPoison$`,
			})

			if (target.slot.row.health && target.slot.row.health >= 30) {
				let damage = Math.max(Math.min(target.slot.row.health - 10, 20), 0)
				statusEffectAttack.addDamage(effect.entity, damage)
			}

			executeExtraAttacks(game, [statusEffectAttack], true)
		})

		player.hooks.afterDefence.add(effect, (attack) => {
			if (!attack.isTargetting(target) || attack.target?.health) return
			effect.remove()
		})
	}

	override onRemoval(_game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player, opponentPlayer} = target
		opponentPlayer.hooks.onTurnEnd.remove(effect)
		player.hooks.afterDefence.remove(effect)
	}
}

export default Poison
