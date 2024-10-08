import {item} from '../defaults'
import {Item} from '../types'

const BuilderDoubleItem: Item = {
	...item,
	id: 'item_builder_rare',
	numericId: 52,
	name: 'Builder Item x2',
	shortName: 'Builder',
	description: 'Counts as 2 Builder Item cards.',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'builder',
	energy: ['builder', 'builder'],
}

export default BuilderDoubleItem
