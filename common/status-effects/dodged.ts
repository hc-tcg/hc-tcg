import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {HERMIT_CARDS} from '../cards'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {getActiveRow, removeStatusEffect} from '../utils/board'
import {AttackModel } from '../models/attack-model'
import {StatusEffectT} from '../types/game-state'
import {isTargetingPos} from '../utils/attacks'

class DodgedStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'dodged',
			name: 'Opponent Missed',
			description: 'Opponent missed their attack last turn.',
			duration: 1,
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

			removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const { player, opponentPlayer } = pos
		opponentPlayer.hooks.beforeAttack.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default DodgedStatusEffect