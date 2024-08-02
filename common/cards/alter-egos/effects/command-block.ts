import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class CommandBlock extends Card {
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

	override onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.availableEnergy, (availableEnergy) => {
			if (!component.slot.inRow()) return availableEnergy
			if (player.activeRowEntity !== component.slot.row.entity)
				return availableEnergy

			// Turn all the energy into any energy
			return availableEnergy.map(() => 'any')
		})

		observer.subscribe(player.hooks.freezeSlots, () => {
			if (!component.slot.inRow()) return query.nothing
			return query.every(
				query.slot.player(player.entity),
				query.slot.rowIs(component.slot.row.entity),
				query.slot.attach,
			)
		})
	}
}

export default CommandBlock
