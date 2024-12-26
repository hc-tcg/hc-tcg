import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}

const SpeedrunnerDoubleItem: Item = {
	...item,
	id: 'item_speedrunner_rare',
	numericId: 0.039,
	name: 'Speedrunner Item x2',
	shortName: 'Speedrunner',
	description: 'Counts as 2 Speedrunner Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['speedrunner'],
	energy: ['speedrunner', 'speedrunner'],
}

export default SpeedrunnerDoubleItem
