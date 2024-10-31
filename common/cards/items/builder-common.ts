import {item} from '../defaults'
import {Item} from '../types'

const BuilderItem: Item = {
	...item,
	id: 'item_builder_common',
	numericId: 51,
	name: 'Builder Item',
	shortName: 'Builder',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'builder',
	energy: ['builder'],
}

export default BuilderItem
