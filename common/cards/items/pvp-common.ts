import {item} from '../defaults'
import {Item} from '../types'

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
