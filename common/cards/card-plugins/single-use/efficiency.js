import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

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
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos
		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			player.hooks.availableEnergy[instance] = (availableEnergy) => {
				// Unliimited powwa
				return ['any', 'any', 'any']
			}

			player.hooks.afterAttack[instance] = (attack) => {
				delete player.hooks.availableEnergy[instance]
				delete player.hooks.afterAttack[instance]
				delete player.hooks.onTurnEnd[instance]
			}

			// In case the player does not attack
			player.hooks.onTurnEnd[instance] = () => {
				delete player.hooks.availableEnergy[instance]
				delete player.hooks.afterAttack[instance]
				delete player.hooks.onTurnEnd[instance]
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}
}

export default EfficiencySingleUseCard
