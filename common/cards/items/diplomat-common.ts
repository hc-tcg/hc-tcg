import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'diplomat'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const DiplomatItem: Item = {
	...item,
	id: 'item_' + convenience + '_common',
	numericId: 0.014,
	name: capitalize(convenience) + ' Item',
	shortName: capitalize(convenience),
	expansion: 'item',
	rarity: 'common',
	tokens: 0,
	type: [convenience],
	energy: [convenience],
}

export default DiplomatItem
