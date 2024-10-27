import {item} from '../defaults'
import {Item} from '../types'

const MinerDoubleItem: Item = {
	...item,
	id: 'item_miner_rare',
	numericId: 58,
	name: 'Miner Item x2',
	shortName: 'Miner',
	description: 'Counts as 2 Miner Item cards.',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'miner',
	energy: ['miner', 'miner'],
}

export default MinerDoubleItem
