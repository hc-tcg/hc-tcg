import StatusEffect, {Counter, StatusEffectProps, systemStatusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectComponent} from '../types/game-state'

class UsedClockStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		...systemStatusEffect,
		id: 'used-clock',
		name: 'Turn Skipped',
		description: 'Turns can not be skipped consecutively.',
		counter: 1,
		counterType: 'turns',
	}

	override onApply(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player} = pos

		if (!instance.counter) instance.counter = this.props.counter

		player.hooks.onTurnEnd.add(instance, () => {
			if (!instance.counter) return
			instance.counter--

			if (instance.counter === 0) removeStatusEffect(game, pos, instance)
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectComponent, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.beforeAttack.remove(instance)
		player.hooks.onTurnStart.remove(instance)
	}
}

export default UsedClockStatusEffect
