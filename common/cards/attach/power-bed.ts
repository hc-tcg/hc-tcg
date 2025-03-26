import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {attach, item} from '../defaults'
import {Attach} from '../types'

const PowerBed: Attach = {
	...attach,
	id: 'power_bed',
	numericId: -3,
	name: 'Power Bed',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 1,
	description:
		'Attach as an item. Counts as 3 wild items, but the hermit it is attached to loses 40 hp each time it attacks.',
	attachCondition: item.attachCondition,
	log: item.log,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.availableEnergy, (availableEnergy) => {
			if (!component.slot.inRow()) return availableEnergy

			if (player.activeRow?.index !== component.slot.row.index) return availableEnergy

			availableEnergy.push('any', 'any', 'any')
			return availableEnergy
		})
	},
}

export default PowerBed
