import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {HERMIT_CARDS} from '../cards'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectT} from '../types/game-state'

class SlownessStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'slowness',
			name: 'Slowness',
			description: 'This Hermit can only use their primary attack.',
			duration: 1,
			counter: false,
			damageEffect: false,
			visible: true,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player, opponentPlayer} = pos

		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		opponentPlayer.hooks.onTurnStart.add(statusEffectInfo.statusEffectInstance, () => {
			const targetPos = getBasicCardPos(game, statusEffectInfo.targetInstance)
			if (!targetPos || targetPos.rowIndex === null) return

			if (player.board.activeRow === targetPos.rowIndex)
				game.addBlockedActions(this.id, 'SECONDARY_ATTACK')
		})

		opponentPlayer.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
			const targetPos = getBasicCardPos(game, statusEffectInfo.targetInstance)
			if (!targetPos || targetPos.rowIndex === null) return
			if (!statusEffectInfo.duration) return

			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0) {
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
				return
			}
		})

		player.hooks.onHermitDeath.add(statusEffectInfo.statusEffectInstance, (hermitPos) => {
			if (hermitPos.row?.hermitCard?.cardInstance != statusEffectInfo.targetInstance) return
			removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onTurnStart.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.onHermitDeath.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default SlownessStatusEffect
