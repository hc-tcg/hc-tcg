import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const RedstoneDoubleItem: Item = {
	...item,
	id: 'item_redstone_rare',
	numericId: 0.035,
	name: 'Redstone Item x2',
	shortName: 'Redstone',
	description: 'Counts as 2 Redstone Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['redstone'],
	energy: ['redstone', 'redstone'],
}

export default RedstoneDoubleItem
