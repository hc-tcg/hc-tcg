import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const JackCommon: Hermit = {
	...hermit,
	id: 'jack_rare',
	numericId: 131,
	name: 'Jack',
	expansion: 'advent_of_tcg',
	palette: 'default',
	rarity: 'rare',
	tokens: 2,
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
