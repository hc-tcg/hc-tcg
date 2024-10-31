import {hermit} from '../defaults'
import {Hermit} from '../types'

const RenbobCommon: Hermit = {
	...hermit,
	id: 'renbob_common',
	numericId: 169,
	name: 'Renbob',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 1,
	type: 'speedrunner',
	health: 290,
	primary: {
		name: 'Gas Money',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Road Trip',
		cost: ['speedrunner', 'speedrunner', 'speedrunner'],
		damage: 100,
		power: null,
	},
}

export default RenbobCommon
