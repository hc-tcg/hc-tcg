import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const BalancedDoubleItem: Item = {
	...item,
	id: 'item_balanced_rare',
	numericId: 0.005,
	name: 'Balanced Item x2',
	shortName: 'Balanced',
	description: 'Counts as 2 Balanced Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['balanced'],
	energy: ['balanced', 'balanced'],
}

export default BalancedDoubleItem
