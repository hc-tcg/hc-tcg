import {hermit} from '../defaults'
import {Hermit} from '../types'

const HelsknightCommon: Hermit = {
	...hermit,
	id: 'helsknight_common',
	numericId: 1178,
	name: 'Helsknight',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['miner'],
	health: 270,
	primary: {
		name: 'Slash',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Diabolical',
		cost: ['miner', 'miner'],
		damage: 80,
		power: null,
	},
}

export default HelsknightCommon
