import {item} from '../defaults'
import {Item} from '../types'

const FarmItem: Item = {
	...item,
	id: 'item_farm_common',
	numericId: 55,
	name: 'Farm Item',
	shortName: 'Farm',
	expansion: 'alter_egos_iii',
	rarity: 'common',
	tokens: 0,
	type: 'farm',
	energy: ['farm'],
}

export default FarmItem
