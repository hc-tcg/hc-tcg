import Card from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

class WildDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_any_rare',
		numericId: 227,
		name: 'Wild Item x2',
		description: 'Counts as 2 Wild Item cards.',
		shortName: 'Wild',
		expansion: 'advent_of_tcg',
		rarity: 'rare', // Must be rare for client to render (x2)
		tokens: 4,
		type: 'any',
		energy: ['any', 'any'],
	}
}

export default WildDoubleItem
