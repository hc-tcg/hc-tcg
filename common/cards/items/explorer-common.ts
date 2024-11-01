import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const ExplorerItem: Item = {
	...item,
	id: 'item_explorer_common',
	numericId: 53,
	name: 'Explorer Item',
	shortName: 'Explorer',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: ['explorer'],
	energy: ['explorer'],
}

export default ExplorerItem
