import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'scavenger'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const ScavengerItem: Item = {
	...item,
	id: 'item_' + convenience + '_common',
	numericId: 0.036,
	name: capitalize(convenience) + ' Item',
	shortName: capitalize(convenience),
	expansion: 'item',
	rarity: 'common',
	tokens: 0,
	type: [convenience],
	energy: [convenience],
}

export default ScavengerItem
