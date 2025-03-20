import {hermit} from '../defaults'
import {Hermit} from '../types'

const LlamadadCommmon: Hermit = {
	...hermit,
	id: 'llamadad_common',
	numericId: 1240,
	name: 'Llamadad',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['prankster'],
	health: 280,
	primary: {
		name: 'Fairness',
		cost: ['prankster'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Vengeance',
		cost: ['prankster', 'prankster'],
		damage: 80,
		power: null,
	},
}

export default LlamadadCommmon
