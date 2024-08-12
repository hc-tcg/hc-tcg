import {item} from '../../base/defaults'
import {Item} from '../../base/types'

const WildDoubleItem: Item = {
	...item,
	id: 'item_any_rare',
	numericId: 227,
	name: 'Wild Item x2',
	description: 'Counts as 2 Wild Item cards.',
	shortName: 'Wild',
	expansion: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 4,
	type: 'any',
	energy: ['any', 'any'],
}

export default WildDoubleItem
