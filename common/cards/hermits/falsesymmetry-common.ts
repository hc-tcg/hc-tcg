import {hermit} from '../defaults'
import {Hermit} from '../types'

const FalseSymmetryCommon: Hermit = {
	...hermit,
	id: 'falsesymmetry_common',
	numericId: 15,
	name: 'False',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: ['pvp'],
	health: 250,
	primary: {
		name: 'Queen of Hearts',
		cost: ['pvp'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Eagle Eye',
		cost: ['pvp', 'any'],
		damage: 70,
		power: null,
	},
}

export default FalseSymmetryCommon
