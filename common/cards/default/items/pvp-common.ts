import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class PvPItem extends Card {
	props: Item = {
		...item,
		id: 'item_pvp_common',
		numericId: 61,
		name: 'PvP Item',
		shortName: 'PvP',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'pvp',
		energy: ['pvp'],
	}
}

export default PvPItem
