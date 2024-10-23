import {item} from '../defaults'
import {Item} from '../types'

const MinerItem: Item = {
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

export default MinerItem
