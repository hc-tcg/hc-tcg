import {hermit} from '../defaults'
import {Hermit} from '../types'

const SmallishbeansCommon: Hermit = {
	...hermit,
	id: 'smallishbeans_common',
	numericId: 160,
	name: 'Joel',
	expansion: 'season_x',
	rarity: 'common',
	tokens: 0,
	type: 'pvp',
	health: 300,
	primary: {
		name: 'Shut Up',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Insult',
		cost: ['pvp', 'pvp'],
		damage: 80,
		power: null,
	},
}

export default SmallishbeansCommon
