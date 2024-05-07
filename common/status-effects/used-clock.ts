import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {HERMIT_CARDS} from '../cards'
import {CardPosModel, getCardPos} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {AttackModel} from '../models/attack-model'
import {StatusEffectT} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'
import {STRENGTHS} from '../const/strengths'
import {WEAKNESS_DAMAGE} from '../const/damage'

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

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player} = pos

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		player.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
			if (!statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0)
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.beforeAttack.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default UsedClockStatusEffect
