import StatusEffect, {StatusEffectProps, Counter, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, StatusEffectComponent} from '../components'

class SleepingStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'sleeping',
		name: 'Sleep',
		description:
			'While your Hermit is sleeping, you can not attack or make your active Hermit go AFK. If sleeping Hermit is made AFK by your opponent, they wake up.',
		counter: 3,
		counterType: 'turns',
	}

	override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player} = target

		effect.counter = this.props.counter
		
		if (!target.slot.inRow()) return
		if (!target.isHealth()) return

		game.addBlockedActions(
			this.props.id,
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'CHANGE_ACTIVE_HERMIT'
		)

		target.slot.row.health = target.props.health

		game.battleLog.addEntry(
			player.entity,
			`$p${target.props.name}$ went to $eSleep$ and restored $gfull health$`
		)

		player.hooks.onTurnStart.add(effect, () => {
			if (!target.slot.inRow()) return
			if (effect.counter !== null) effect.counter--

			if (effect.counter === 0) {
				effect.remove()
				return
			}

			if (player.activeRowEntity === target.slot.row.entity) {
				game.addBlockedActions(
					this.props.id,
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'CHANGE_ACTIVE_HERMIT'
				)
			}
		})

		player.hooks.afterDefence.add(target, (attack) => {
			if (!target.slot.inRow()) return
			if (attack.target?.entity !== target.slot.row.entity) return
			if (target.slot.row.health) return
			effect.remove()
		})
	}

	override onRemoval(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player} = target
		player.hooks.onTurnStart.remove(target)
		player.hooks.afterDefence.remove(target)
	}
}

export default SleepingStatusEffect
