import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const PvPItem: Item = {
	...item,
	id: 'item_pvp_common',
	numericId: 0.032,
	name: 'PvP Item',
	shortName: 'PvP',
	expansion: 'item',
	rarity: 'common',
	tokens: 0,
	type: ['pvp'],
	energy: ['pvp'],
}

export default PvPItem
