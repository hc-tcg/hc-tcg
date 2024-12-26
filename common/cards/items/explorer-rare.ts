import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const ExplorerDoubleItem: Item = {
	...item,
	id: 'item_explorer_rare',
	numericId: 0.017,
	name: 'Explorer Item x2',
	shortName: 'Explorer',
	description: 'Counts as 2 Explorer Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['explorer'],
	energy: ['explorer', 'explorer'],
}

export default ExplorerDoubleItem
