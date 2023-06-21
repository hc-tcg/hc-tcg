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
	 * @param {import('types/pick-process').PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {player} = pos

		player.hooks.availableEnergy[instance] = (availableEnergy) => {
			// Unliimited powwa
			return ['any', 'any', 'any']
		}

		player.hooks.afterAttack[instance] = (attack) => {
			delete player.hooks.availableEnergy[instance]
			delete player.hooks.afterAttack[instance]
		}
	}
}

export default EfficiencySingleUseCard
