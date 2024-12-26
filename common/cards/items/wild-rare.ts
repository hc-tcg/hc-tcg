import {item} from '../defaults'
import {Item} from '../types'

const WildDoubleItem: Item = {
	...item,
	id: 'item_any_rare',
	numericId: 0.101,
	name: 'Wild Item x2',
	description: 'Counts as 2 Wild Item cards.',
	shortName: 'Wild',
	expansion: 'item',
	rarity: 'ultra_rare',
	tokens: 4,
	type: ['any'],
	energy: ['any', 'any'],
}

export default WildDoubleItem
