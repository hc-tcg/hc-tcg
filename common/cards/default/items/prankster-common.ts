import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Item} from '../../base/types'

class PranksterItem extends CardOld {
	props: Item = {
		...item,
		id: 'item_prankster_common',
		numericId: 59,
		name: 'Prankster Item',
		shortName: 'Prankster',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'prankster',
		energy: ['prankster'],
	}
}

export default PranksterItem
