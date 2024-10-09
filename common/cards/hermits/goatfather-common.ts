import {hermit} from '../defaults'
import {Hermit} from '../types'

const GoatfatherCommon: Hermit = {
	...hermit,
	id: 'goatfather_common',
	numericId: 179,
	name: 'Goatfather',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: 'prankster',
	health: 270,
	primary: {
		name: 'Pettiness',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Sand Duper',
		cost: ['prankster', 'prankster', 'any'],
		damage: 90,
		power: null,
	},
}

export default GoatfatherCommon
