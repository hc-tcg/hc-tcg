import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const ZookeeperScarCommon: Hermit = {
	...hermit,
	id: 'zookeeperscar_common',
	numericId: 259,
	name: 'Zookeeper Scar',
	shortName: 'Zookeeper',
	expansion: 'advent_of_tcg_ii',
	palette: 'advent_of_tcg_ii',
	background: 'advent_of_tcg_ii',
	rarity: 'common',
	tokens: 0,
	type: 'farm',
	health: 290,
	primary: {
		name: 'Hazard',
		cost: ['farm'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Full Steam',
		cost: ['farm', 'farm'],
		damage: 80,
		power: null,
	},
}

export default ZookeeperScarCommon
