import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const RedstoneItem: Item = {
	...item,
	id: 'item_redstone_common',
	numericId: 0.034,
	name: 'Redstone Item',
	shortName: 'Redstone',
	expansion: 'item',
	rarity: 'common',
	tokens: 0,
	type: ['redstone'],
	energy: ['redstone'],
}

export default RedstoneItem
