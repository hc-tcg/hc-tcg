import Card from '../../base/card'
import {item} from '../../base/defaults'
import {Item} from '../../base/types'

class MinerItem extends Card {
	props: Item = {
		...item,
		id: 'item_miner_common',
		numericId: 57,
		name: 'Miner Item',
		shortName: 'Miner',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		type: 'miner',
		energy: ['miner'],
	}
}

export default MinerItem
