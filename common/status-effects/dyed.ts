import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel} from '../models/card-pos-model'
import {StatusEffectInstance} from '../types/game-state'

class DyedStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'dyed',
			name: 'Dyed',
			description: 'Items attached to this Hermit become any type.',
			duration: 0,
			counter: false,
			damageEffect: false,
			visible: true,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectInstance, pos: CardPosModel) {
		const {player} = pos

		const hasDyed = game.state.statusEffects.some(
			(a) => a.targetInstance.instance === pos.card?.instance && a.statusEffectId === 'dyed'
		)

		if (hasDyed) return

		game.state.statusEffects.push(statusEffectInfo)

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
