import {hermit} from '../defaults'
import {Hermit} from '../types'

const GoodTimesWithScarCommon: Hermit = {
	...hermit,
	id: 'goodtimeswithscar_common',
	numericId: 39,
	name: 'Scar',
	expansion: 'default',
	rarity: 'common',
	tokens: 1,
	type: ['terraform'],
	health: 260,
	primary: {
		name: 'Jellie Paws',
		cost: ['terraform'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Hot Guy',
		cost: ['terraform', 'terraform', 'terraform'],
		damage: 100,
		power: null,
	},
}

export default GoodTimesWithScarCommon
