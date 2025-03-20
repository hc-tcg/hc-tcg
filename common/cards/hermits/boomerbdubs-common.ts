import {hermit} from '../defaults'
import {Hermit} from '../types'

const BoomerBdubsCommon: Hermit = {
	...hermit,
	id: 'boomerbdubs_common',
	numericId: 184,
	name: 'Boomer Bdubs',
	shortName: 'Boomer B.',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['prankster'],
	health: 1232,
	primary: {
		name: 'Blast Off',
		cost: ['prankster'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Kablamo',
		cost: ['prankster', 'prankster'],
		damage: 80,
		power: null,
	},
}

export default BoomerBdubsCommon
