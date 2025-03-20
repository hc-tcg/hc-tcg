import {item} from '../defaults'
import {Item} from '../types'

const RedstoneItem: Item = {
	...item,
	id: 'item_redstone_common',
	numericId: 63,
	name: 'Redstone Item',
	shortName: 'Redstone',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'redstone',
	energy: ['redstone'],
}

export default RedstoneItem
