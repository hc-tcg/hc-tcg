import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import EffectCard from '../base/effect-card'

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

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.availableEnergy.add(instance, (availableEnergy) => {
			const {activeRow, rows} = player.board

			// Make sure it's our row
			if (activeRow === null) return availableEnergy
			if (activeRow !== pos.rowIndex) return availableEnergy
			const row = rows[activeRow]

			// Make sure this row has our instance
			if (row.effectCard?.cardInstance !== instance) return availableEnergy

			// Turn all the energy into any energy
			return availableEnergy.map(() => 'any')
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.availableEnergy.remove(instance)
	}

	override getIsRemovable() {
		return false
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default CommandBlockEffectCard
