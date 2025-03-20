import {hermit} from '../defaults'
import {Hermit} from '../types'

const JinglerCommon: Hermit = {
	...hermit,
	id: 'jingler_common',
	numericId: 1228,
	name: 'Jingler',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['redstone'],
	health: 300,
	primary: {
		name: 'Pranked',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Misdirection',
		cost: ['redstone', 'redstone'],
		damage: 80,
		power: null,
	},
}

export default JinglerCommon
