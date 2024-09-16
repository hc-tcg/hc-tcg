import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const LlamadadCommmon: Hermit = {
	...hermit,
	id: 'llamadad_common',
	numericId: 176,
	name: 'Llamadad',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: 'prankster',
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
