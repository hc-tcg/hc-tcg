import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

const PranksterDoubleItem: Item = {
	...item,
	id: 'item_prankster_rare',
	numericId: 60,
	name: 'Prankster Item x2',
	shortName: 'Prankster',
	description: 'Counts as 2 Prankster Item cards.',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'prankster',
	energy: ['prankster', 'prankster'],
}

export default PranksterDoubleItem
