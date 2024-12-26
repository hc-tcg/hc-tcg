import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const FarmDoubleItem: Item = {
	...item,
	id: 'item_farm_rare',
	numericId: 0.019,
	name: 'Farm Item x2',
	shortName: 'Farm',
	description: 'Counts as 2 Farm Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['farm'],
	energy: ['farm', 'farm'],
}

export default FarmDoubleItem
