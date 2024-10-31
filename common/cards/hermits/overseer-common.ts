import {hermit} from '../defaults'
import {Hermit} from '../types'

const OverseerCommon: Hermit = {
	...hermit,
	id: 'overseer_common',
	numericId: 165,
	name: 'Overseer',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 1,
	type: 'miner',
	health: 280,
	primary: {
		name: 'Containment',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Demise',
		cost: ['miner', 'miner', 'miner'],
		damage: 100,
		power: null,
	},
}

export default OverseerCommon
