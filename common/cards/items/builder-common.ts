import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const BuilderItem: Item = {
	...item,
	id: 'item_builder_common',
	numericId: 0.008,
	name: 'Builder Item',
	shortName: 'Builder',
	expansion: 'item',
	rarity: 'common',
	tokens: 0,
	type: ['builder'],
	energy: ['builder'],
}

export default BuilderItem
