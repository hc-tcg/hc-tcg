import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class BalancedItem extends Card {
	props: Item = {
		...item,
		id: 'item_balanced_common',
		numericId: 49,
		name: 'Balanced Item',
		shortName: 'Balanced',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'balanced',
		energy: ['balanced'],
	}
}

export default BalancedItem
