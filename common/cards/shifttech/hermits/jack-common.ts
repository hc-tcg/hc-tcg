import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const JackCommon: Hermit = {
	...hermit,
	id: 'jack_common',
	numericId: 131,
	name: 'Jack',
	expansion: 'shifttech',
	rarity: 'rare',
	tokens: 0,
	type: ['pacifist'],
	health: 270,
	primary: {
		name: 'French Empire',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'New Story',
		cost: ['pacifist', 'any'],
		damage: 70,
		power: null,
	},
}

export default JackCommon
