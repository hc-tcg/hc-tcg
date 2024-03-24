import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {HERMIT_CARDS} from '../cards'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {removeStatusEffect} from '../utils/board'
import {StatusEffectT} from '../types/game-state'

class SleepingStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'sleeping',
			name: 'Sleeping',
			description:
				'When applied, restore Full Health. Can not attack. Can not go AFK. Can still draw and attach cards while sleeping.',
			duration: 3,
			counter: false,
			damageEffect: false,
			visible: true,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, card, row} = pos

		if (!card || !row?.hermitCard) return

		game.state.statusEffects.push(statusEffectInfo)
		game.addBlockedActions(this.id, 'PRIMARY_ATTACK', 'SECONDARY_ATTACK', 'CHANGE_ACTIVE_HERMIT')
		if (!statusEffectInfo.duration) statusEffectInfo.duration = this.duration

		row.health = HERMIT_CARDS[card.cardId].health

		player.hooks.onTurnStart.add(statusEffectInfo.statusEffectInstance, () => {
			const targetPos = getBasicCardPos(game, statusEffectInfo.targetInstance)
			if (!targetPos || !statusEffectInfo.duration) return
			statusEffectInfo.duration--

			if (statusEffectInfo.duration === 0 || player.board.activeRow !== targetPos.rowIndex) {
				removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
				return
			}

			if (player.board.activeRow === targetPos.rowIndex)
				game.addBlockedActions(
					this.id,
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'CHANGE_ACTIVE_HERMIT'
				)
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

export default SleepingStatusEffect
