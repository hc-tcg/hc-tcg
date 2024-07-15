import StatusEffect, {Counter, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardComponent, StatusEffectComponent} from '../components'

class UsedClockStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...systemStatusEffect,
		id: 'used-clock',
		name: 'Turn Skipped',
		description: 'Turns can not be skipped consecutively.',
		counter: 1,
		counterType: 'turns',
	}

	override onApply(game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player} = target

		if (effect.counter === null) effect.counter = this.props.counter

		player.hooks.onTurnEnd.add(effect, () => {
			if (effect.counter === null) return
			if (effect.counter === 0) effect.remove()
			effect.counter--
		})

		player.hooks.onTurnStart.add(effect, () => {
			if (target.slot.inRow() && target.slot.row.entity === player.activeRow?.entity)
				game.addBlockedActions(this.props.id, 'SECONDARY_ATTACK')
		})
	}

	override onRemoval(_game: GameModel, effect: StatusEffectComponent, target: CardComponent) {
		const {player, opponentPlayer} = target
		opponentPlayer.hooks.beforeAttack.remove(effect)
		player.hooks.onTurnStart.remove(effect)
	}
}

export default UsedClockStatusEffect
