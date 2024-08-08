import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

class RedstoneDoubleItem extends CardOld {
	props: Item & Description = {
		...item,
		id: 'item_redstone_rare',
		numericId: 64,
		name: 'Redstone Item x2',
		shortName: 'Redstone',
		description: 'Counts as 2 Redstone Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'redstone',
		energy: ['redstone', 'redstone'],
	}
}

export default RedstoneDoubleItem
