import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}
const PranksterDoubleItem: Item = {
	...item,
	id: 'item_prankster_rare',
	numericId: 0.031,
	name: 'Prankster Item x2',
	shortName: 'Prankster',
	description: 'Counts as 2 Prankster Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['prankster'],
	energy: ['prankster', 'prankster'],
}

export default PranksterDoubleItem
