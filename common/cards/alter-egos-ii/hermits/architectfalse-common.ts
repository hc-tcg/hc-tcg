import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const ArchitectFalseCommon: Hermit = {
	...hermit,
	id: 'architectfalse_common',
	numericId: 227,
	name: 'Grand Architect',
	shortName: 'G. Architect',
	expansion: 'alter_egos_ii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: 'speedrunner',
	health: 270,
	primary: {
		name: 'Oxidize',
		cost: ['speedrunner'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Crossover',
		cost: ['speedrunner', 'speedrunner', 'any'],
		damage: 90,
		power: null,
	},
}

export default ArchitectFalseCommon
