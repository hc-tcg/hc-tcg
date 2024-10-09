import {item} from '../defaults'
import {Item} from '../types'

const RedstoneDoubleItem: Item = {
	...item,
	id: 'item_redstone_rare',
	numericId: 64,
	name: 'Redstone Item x2',
	shortName: 'Redstone',
	description: 'Counts as 2 Redstone Item cards.',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'redstone',
	energy: ['redstone', 'redstone'],
}

export default RedstoneDoubleItem
