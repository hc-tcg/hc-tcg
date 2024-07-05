import StatusEffect, {StatusEffectProps, statusEffect} from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {StatusEffectInstance} from '../types/game-state'
import {slot} from '../slot'

class DyedStatusEffect extends StatusEffect {
	props: StatusEffectProps = {
		...statusEffect,
		id: 'dyed',
		name: 'Dyed',
		description: 'Items attached to this Hermit become any type.',
		applyCondition: slot.not(slot.hasStatusEffect('dyed')),
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.availableEnergy.add(statusEffectInfo, (availableEnergy) => {
			if (player.board.activeRow === null) return availableEnergy

			const activeRow = player.board.rows[player.board.activeRow]

			if (statusEffectInfo.targetInstance.instance !== activeRow.hermitCard?.instance)
				return availableEnergy

			return availableEnergy.map(() => 'any')
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.availableEnergy.remove(statusEffectInfo)
		opponentPlayer.hooks.onTurnEnd.remove(statusEffectInfo)
	}
}

export default DyedStatusEffect
