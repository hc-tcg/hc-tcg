import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

class BalancedDoubleItem extends CardOld {
	props: Item & Description = {
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
}

export default BalancedDoubleItem
