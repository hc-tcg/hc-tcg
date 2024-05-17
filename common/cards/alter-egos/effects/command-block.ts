import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import EffectCard from '../../base/effect-card'

class CommandBlockEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'command_block',
			numericId: 120,
			name: 'Command Block',
			rarity: 'rare',
			description:
				'The Hermit this card is attached to can use items of any type. Once attached, this card can not be removed from this Hermit.',
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
