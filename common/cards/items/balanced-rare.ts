import {item} from '../defaults'
import {Item} from '../types'

const BalancedDoubleItem: Item = {
	...item,
	id: 'item_balanced_rare',
	numericId: 50,
	name: 'Balanced Item x2',
	shortName: 'Balanced',
	description: 'Counts as 2 Balanced Item cards.',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'balanced',
	energy: ['balanced', 'balanced'],
}

export default BalancedDoubleItem
