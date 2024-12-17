import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const ZookeeperScarCommon: Hermit = {
	...hermit,
	id: 'zookeeperscar_common',
	numericId: 259,
	name: 'Zookeeper Scar',
	expansion: 'advent_of_tcg_ii',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	type: 'farm',
	health: 290,
	primary: {
		name: 'Lasso',
		cost: ['farm'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Choo Choo',
		cost: ['farm', 'farm'],
		damage: 80,
		power: null,
	},
}

export default ZookeeperScarCommon
