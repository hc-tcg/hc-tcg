import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class EfficiencySingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'efficiency',
			name: 'Efficiency',
			rarity: 'rare',
			description:
				'Use an attack from your active Hermit without having the necessary item cards attached.',
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos
		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default EfficiencySingleUseCard
