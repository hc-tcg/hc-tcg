import CardOld from '../../base/card'
import {item} from '../../base/defaults'
import {Item} from '../../base/types'

class SpeedrunnerItem extends CardOld {
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
