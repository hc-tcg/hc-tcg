import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const PvPDoubleItem: Item = {
	...item,
	id: 'item_pvp_rare',
	numericId: 62,
	name: 'PvP Item x2',
	shortName: 'PvP',
	description: 'Counts as 2 PvP Item cards.',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: ['pvp'],
	energy: ['pvp', 'pvp'],
}

export default PvPDoubleItem
