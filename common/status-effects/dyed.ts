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

	override onApply(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		player.hooks.availableEnergy.add(instance, (availableEnergy) => {
			if (player.board.activeRow === null) return availableEnergy

			const activeRow = player.board.rows[player.board.activeRow]

			if (instance.targetInstance.instance !== activeRow.hermitCard?.instance)
				return availableEnergy

			return availableEnergy.map(() => 'any')
		})
	}

	override onRemoval(game: GameModel, instance: StatusEffectInstance, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.availableEnergy.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
	}
}

export default DyedStatusEffect
