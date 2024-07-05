import StatusEffect, {Counter, StatusEffectProps} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {slot} from '../slot'

class SlownessStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		id: 'slowness',
		name: 'Slowness',
		description: 'This Hermit can only use their primary attack.',
		counter: 1,
		counterType: 'turns',
		damageEffect: false,
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		game.state.statusEffects.push(statusEffectInfo)
		const {player} = pos

		if (!statusEffectInfo.counter) statusEffectInfo.counter = this.props.counter

		if (pos.card) {
			game.battleLog.addEntry(player.id, `$p${pos.card.props.name}$ was inflicted with $eSlowness$`)
		}

		player.hooks.onTurnStart.add(statusEffectInfo, () => {
			const targetPos = game.findSlot(slot.hasInstance(statusEffectInfo.targetInstance))
			if (!targetPos || targetPos.rowIndex === null) return

			if (player.board.activeRow === targetPos.rowIndex)
				game.addBlockedActions(this.props.id, 'SECONDARY_ATTACK')
		})

		player.hooks.onTurnEnd.add(statusEffectInfo, () => {
			const targetPos = game.findSlot(slot.hasInstance(statusEffectInfo.targetInstance))
			if (!targetPos || targetPos.rowIndex === null) return
			if (!statusEffectInfo.counter) return

			statusEffectInfo.counter--

			if (statusEffectInfo.counter === 0) {
				removeStatusEffect(game, pos, statusEffectInfo)
				return
			}
		})

		player.hooks.afterDefence.add(statusEffectInfo, (attack) => {
			const attackTarget = attack.getTarget()
			if (!attackTarget) return
			if (attackTarget.row.hermitCard.instance !== statusEffectInfo.targetInstance.instance) return
			if (attackTarget.row.health > 0) return
			removeStatusEffect(game, pos, statusEffectInfo)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onTurnStart.remove(statusEffectInfo)
		player.hooks.onTurnEnd.remove(statusEffectInfo)
		player.hooks.afterDefence.remove(statusEffectInfo)
	}
}

export default SlownessStatusEffect
