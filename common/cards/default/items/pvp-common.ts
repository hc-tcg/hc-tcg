import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Item} from '../../base/types'

const PvPItem: Item = {
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

export default PvPItem
