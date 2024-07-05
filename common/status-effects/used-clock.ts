import StatusEffect, {Counter, StatusEffectProps} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'

class UsedClockStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		id: 'used-clock',
		name: 'Turn Skipped',
		description: 'Turns can not be skipped consecutively.',
		counter: 2,
		counterType: 'turns',
		damageEffect: false,
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player} = pos

		if (!statusEffectInfo.counter) statusEffectInfo.counter = this.props.counter

		player.hooks.onTurnEnd.add(statusEffectInfo, () => {
			if (!statusEffectInfo.counter) return
			statusEffectInfo.counter--

			if (statusEffectInfo.counter === 0) removeStatusEffect(game, pos, statusEffectInfo)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.beforeAttack.remove(statusEffectInfo)
		player.hooks.onTurnStart.remove(statusEffectInfo)
	}
}

export default UsedClockStatusEffect
