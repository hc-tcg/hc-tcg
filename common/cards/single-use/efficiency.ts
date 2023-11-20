import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class EfficiencySingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'efficiency',
			numericId: 17,
			name: 'Efficiency',
			rarity: 'rare',
			description:
				'Use an attack from your active Hermit without having the necessary item cards attached.',
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.add(instance, (pickedSlots) => {
			player.hooks.availableEnergy.add(instance, (availableEnergy) => {
				// Unliimited powwa
				return ['any', 'any', 'any']
			})

			player.hooks.afterAttack.add(instance, (attack) => {
				player.hooks.availableEnergy.remove(instance)
				player.hooks.afterAttack.remove(instance)
				player.hooks.onTurnEnd.remove(instance)
			})

			// In case the player does not attack
			player.hooks.onTurnEnd.add(instance, () => {
				player.hooks.availableEnergy.remove(instance)
				player.hooks.afterAttack.remove(instance)
				player.hooks.onTurnEnd.remove(instance)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default EfficiencySingleUseCard
