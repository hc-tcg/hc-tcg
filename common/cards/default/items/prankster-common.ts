import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class PranksterItem extends Card {
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
