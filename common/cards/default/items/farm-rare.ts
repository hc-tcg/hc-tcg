import Card from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

class FarmDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_farm_rare',
		numericId: 56,
		name: 'Farm Item x2',
		shortName: 'Farm',
		description: 'Counts as 2 Farm Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'farm',
		energy: ['farm', 'farm'],
	}
}

export default FarmDoubleItem
