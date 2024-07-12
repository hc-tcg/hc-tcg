import StatusEffect, {Counter, StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {removeStatusEffect} from '../utils/board'
import {slot} from '../components/query'
import {CardComponent, StatusEffectComponent} from '../components'

class SlownessStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...statusEffect,
		id: 'slowness',
		name: 'Slowness',
		description: 'This Hermit can only use their primary attack.',
		counter: 1,
		counterType: 'turns',
	}

	override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player} = target

		if (!effect.counter) effect.counter = this.props.counter

		player.hooks.onTurnStart.add(effect, () => {
			if (target.slot?.onBoard() && player.activeRowEntity === target.slot.row?.entity)
				game.addBlockedActions(this.props.id, 'SECONDARY_ATTACK')
		})

		player.hooks.onTurnEnd.add(effect, () => {
			if (!effect.counter) return
			effect.counter--

			if (effect.counter === 0) {
				effect.remove()
				return
			}
		})

		player.hooks.afterDefence.add(effect, (attack) => {
			if (!target.slot?.onBoard() || attack.target?.entity !== target.slot.row?.entity) return
			if (target.slot.row?.health) return
			effect.remove()
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectComponent, target: CardComponent) {
		const {player} = target
		player.hooks.onTurnStart.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		player.hooks.afterDefence.remove(instance)
	}
}

export default SlownessStatusEffect
