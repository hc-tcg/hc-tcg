import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import {query, slot} from '../../../components/query'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class  extends Card {
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

	override onAttach(_game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.availableEnergy.add(component, (availableEnergy) => {
			if (!component.slot.inRow()) return availableEnergy
			if (player.activeRowEntity !== component.slot.row.entity) return availableEnergy

			// Turn all the energy into any energy
			return availableEnergy.map(() => 'any')
		})

		player.hooks.freezeSlots.add(component, () => {
			if (!component.slot.inRow()) return query.nothing
			return query.every(
				slot.player(player.entity),
				slot.rowIs(component.slot.row.entity),
				slot.attachSlot
			)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.availableEnergy.remove(component)
		player.hooks.freezeSlots.remove(component)
	}
}

export default 
