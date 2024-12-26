import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}
const MinerDoubleItem: Item = {
	...item,
	id: 'item_miner_rare',
	numericId: 0.027,
	name: 'Miner Item x2',
	shortName: 'Miner',
	description: 'Counts as 2 Miner Item cards.',
	expansion: 'item',
	rarity: 'rare',
	tokens: 2,
	type: ['miner'],
	energy: ['miner', 'miner'],
}

export default MinerDoubleItem
