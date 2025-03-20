import {hermit} from '../defaults'
import {Hermit} from '../types'

const HumanCleoCommon: Hermit = {
	...hermit,
	id: 'humancleo_common',
	numericId: 1236,
	name: 'Human Cleo',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 1,
	type: ['prankster'],
	health: 250,
	primary: {
		name: 'Heartbeat',
		cost: ['prankster'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Juggernaut',
		cost: ['prankster', 'prankster', 'prankster'],
		damage: 100,
		power: null,
	},
}

export default HumanCleoCommon
