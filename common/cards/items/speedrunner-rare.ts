import {item} from '../defaults'
import {Item} from '../types'

const SpeedrunnerDoubleItem: Item = {
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

export default SpeedrunnerDoubleItem
