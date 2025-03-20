import {item} from '../defaults'
import {Item} from '../types'

const PranksterItem: Item = {
	...item,
	id: 'item_prankster_common',
	numericId: 59,
	name: 'Prankster Item',
	shortName: 'Prankster',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'prankster',
	energy: ['prankster'],
}

export default PranksterItem
