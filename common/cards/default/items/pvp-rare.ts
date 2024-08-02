import Card from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

class PvPDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_pvp_rare',
		numericId: 62,
		name: 'PvP Item x2',
		shortName: 'PvP',
		description: 'Counts as 2 PvP Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'pvp',
		energy: ['pvp', 'pvp'],
	}
}

export default PvPDoubleItem
