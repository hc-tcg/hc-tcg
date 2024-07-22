import Card from '../../base/card'
import {Description, Item} from '../../base/types'
import {item} from '../../base/defaults'

class ExplorerDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_explorer_rare',
		numericId: 54,
		name: 'Explorer Item x2',
		shortName: 'Explorer',
		description: 'Counts as 2 Explorer Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'explorer',
		energy: ['explorer', 'explorer'],
	}
}

export default ExplorerDoubleItem
