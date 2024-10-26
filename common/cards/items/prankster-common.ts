import {item} from '../base/defaults'
import {Item} from '../base/types'

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
