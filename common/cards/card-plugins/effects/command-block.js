import EffectCard from './_effect-card'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 */

class CommandBlockEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'command_block',
			name: 'Command Block',
			rarity: 'rare',
			description:
				"Attach to any active or AFK Hermit.\n\nItems attached to this Hermit become any type.\n\nThis card can only be removed once the Hermit it's attached to is knocked out.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.availableEnergy[instance] = (availableEnergy) => {
			const {activeRow, rows} = player.board

			// Make sure it's our row
			if (activeRow === null) return availableEnergy
			if (activeRow !== pos.rowIndex) return availableEnergy
			const row = rows[activeRow]

			// Make sure this row has our instance
			if (row.effectCard?.cardInstance !== instance) return availableEnergy

			// Turn all the energy into any energy
			return availableEnergy.map(() => 'any')
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.availableEnergy[instance]
	}

	getIsRemovable() {
		return false
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default CommandBlockEffectCard
