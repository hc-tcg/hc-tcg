import StatusEffect from './status-effect'
import { GameModel } from '../models/game-model'
import { HERMIT_CARDS } from '../cards'
import { CardPosModel, getBasicCardPos } from '../models/card-pos-model'
import { getActiveRow, removeStatusEffect } from '../utils/board'
import { AttackModel } from '../models/attack-model'
import { StatusEffectT } from '../types/game-state'
import { isTargetingPos } from '../utils/attacks'

class DegdodStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'degdod',
			name: 'Opponent Missed',
			description: 'Opponent missed their attack last turn.',
			duration: 1,
			counter: false,
			damageEffect: false,
			//visible: false,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const { player } = pos

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		player.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
			const targetPos = getBasicCardPos(game, statusEffectInfo.targetInstance)
			if (!targetPos || targetPos.rowIndex === null) return
			if (!statusEffectInfo.duration) return

			if (!statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0)
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)

			
			if (player.board.activeRow !== targetPos.rowIndex)
				targetPos.rowIndex = player.board.activeRow
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const { player, opponentPlayer } = pos
		opponentPlayer.hooks.beforeAttack.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default DegdodStatusEffect