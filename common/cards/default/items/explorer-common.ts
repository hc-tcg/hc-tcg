import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Item} from '../../base/types'

const ExplorerItem: Item = {
	...item,
	id: 'item_explorer_common',
	numericId: 53,
	name: 'Explorer Item',
	shortName: 'Explorer',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'explorer',
	energy: ['explorer'],
}

export default ExplorerItem
