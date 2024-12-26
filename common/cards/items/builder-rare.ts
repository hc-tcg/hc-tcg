import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const BuilderDoubleItem: Item = {
	...item,
	id: 'item_builder_rare',
	numericId: 0.009,
	name: 'Builder Item x2',
	shortName: 'Builder',
	description: 'Counts as 2 Builder Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['builder'],
	energy: ['builder', 'builder'],
}

export default BuilderDoubleItem
