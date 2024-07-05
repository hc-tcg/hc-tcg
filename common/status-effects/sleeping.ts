import StatusEffect, {StatusEffectProps, Counter} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectInstance} from '../types/game-state'
import {slot} from '../slot'

class SleepingStatusEffect extends StatusEffect {
	props: StatusEffectProps & Counter = {
		id: 'sleeping',
		name: 'Sleep',
		description:
			'While your Hermit is sleeping, you can not attack or make your active Hermit go AFK. If sleeping Hermit is made AFK by your opponent, they wake up.',
		damageEffect: false,
		counter: 3,
		counterType: 'turns',
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player, card, row, rowIndex} = pos

		if (!card || !row?.hermitCard || rowIndex === null || !card.card.isHealth()) return

		game.state.statusEffects.push(statusEffectInfo)
		game.addBlockedActions(
			this.props.id,
			'PRIMARY_ATTACK',
			'SECONDARY_ATTACK',
			'CHANGE_ACTIVE_HERMIT'
		)

		row.health = card.card.props.health

		game.battleLog.addEntry(
			player.id,
			`$p${card.props.name}$ went to $eSleep$ and restored $gfull health$`
		)

		player.hooks.onTurnStart.add(statusEffectInfo, () => {
			const targetPos = game.findSlot(slot.hasInstance(statusEffectInfo.targetInstance))
			if (!targetPos) return
			if (statusEffectInfo.counter !== null) statusEffectInfo.counter--

			if (statusEffectInfo.counter === 0 || player.board.activeRow !== targetPos.rowIndex) {
				removeStatusEffect(game, pos, statusEffectInfo)
				return
			}

			if (player.board.activeRow === targetPos.rowIndex)
				game.addBlockedActions(
					this.props.id,
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'CHANGE_ACTIVE_HERMIT'
				)
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
		player.hooks.afterDefence.remove(statusEffectInfo)
	}
}

export default SleepingStatusEffect
