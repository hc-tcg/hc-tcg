import Card from '../../base/card'
import {item} from '../../base/defaults'
import {Description, Item} from '../../base/types'

class SpeedrunnerDoubleItem extends Card {
	props: Item & Description = {
		...item,
		id: 'item_speedrunner_rare',
		numericId: 66,
		name: 'Speedrunner Item x2',
		shortName: 'Speedrunner',
		description: 'Counts as 2 Speedrunner Item cards.',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'speedrunner',
		energy: ['speedrunner', 'speedrunner'],
	}
}

export default SpeedrunnerDoubleItem
