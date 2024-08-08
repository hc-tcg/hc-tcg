import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

class ExplorerDoubleItem extends CardOld {
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
