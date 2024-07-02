import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'

class UsedClockStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'used-clock',
			name: 'Turn Skipped',
			description: 'Turns can not be skipped consecutively.',
			duration: 2,
			counter: false,
			damageEffect: false,
			visible: false,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player} = pos

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		player.hooks.onTurnEnd.add(statusEffectInfo, () => {
			if (!statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0)
				removeStatusEffect(game, pos, statusEffectInfo)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.beforeAttack.remove(statusEffectInfo)
		player.hooks.onTurnStart.remove(statusEffectInfo)
	}
}

export default UsedClockStatusEffect
