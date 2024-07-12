import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {slot} from '../../../components/query'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class CommandBlockEffectCard extends Card {
	props: Attach = {
		...attach,
		id: 'command_block',
		numericId: 120,
		name: 'Command Block',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
		description:
			'The Hermit this card is attached to can use items of any type. Once attached, this card can not be removed from this Hermit.',
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.availableEnergy.add(component, (availableEnergy) => {
			const {activeRow, rows} = player.board

			// Make sure it's our row
			if (activeRow === null) return availableEnergy
			if (activeRow !== pos.rowIndex) return availableEnergy
			const row = rows[activeRow]

			// Make sure this row has our component
			if (row.effectCard?.component !== component.entity) return availableEnergy

			// Turn all the energy into any energy
			return availableEnergy.map(() => 'any')
		})

		player.hooks.freezeSlots.add(component, () => {
			return slot.every(slot.player, slot.rowIndex(pos.rowIndex), slot.attachSlot)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.availableEnergy.remove(component)
		player.hooks.freezeSlots.remove(component)
	}
}

export default CommandBlockEffectCard
