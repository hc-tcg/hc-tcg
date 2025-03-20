import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'bard'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const BardDoubleItem: Item = {
	...item,
	id: 'item_' + convenience + '_rare',
	numericId: 0.007,
	name: capitalize(convenience) + ' Item x2',
	shortName: capitalize(convenience),
	description: 'Counts as 2 ' + capitalize(convenience) + ' Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: [convenience],
	energy: [convenience, convenience],
}

export default BardDoubleItem
