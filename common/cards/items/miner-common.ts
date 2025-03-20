import {item} from '../defaults'
import {Item} from '../types'

const convenience = 'anarchist'
function capitalize(s: string) {
	return s[0].toUpperCase() + s.slice(1)
}
const MinerItem: Item = {
	...item,
	id: 'item_miner_common',
	numericId: 0.026,
	name: 'Miner Item',
	shortName: 'Miner',
	expansion: 'item',
	rarity: 'common',
	tokens: 0,
	type: ['miner'],
	energy: ['miner'],
}

export default MinerItem
