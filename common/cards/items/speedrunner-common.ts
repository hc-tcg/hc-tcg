import {item} from '../defaults'
import {Item} from '../types'

const SpeedrunnerItem: Item = {
	...item,
	id: 'item_speedrunner_common',
	numericId: 65,
	name: 'Speedrunner Item',
	shortName: 'Speedrunner',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'speedrunner',
	energy: ['speedrunner'],
}

export default SpeedrunnerItem
