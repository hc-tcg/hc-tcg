import Card from '../../base/card'
import {Item} from '../../base/types'
import {item} from '../../base/defaults'

class SpeedrunnerItem extends Card {
	props: Item = {
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
}

export default SpeedrunnerItem
