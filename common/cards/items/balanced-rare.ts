import {item} from '../base/defaults'
import {Item} from '../base/types'

const BalancedDoubleItem: Item = {
	...item,
	id: 'item_balanced_rare',
	numericId: 50,
	name: 'Balanced Item ×2',
	shortName: 'Balanced',
	description: 'Counts as 2 Balanced Item cards.',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'balanced',
	energy: ['balanced', 'balanced'],
}

export default BalancedDoubleItem
