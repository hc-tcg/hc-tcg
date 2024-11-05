import {hermit} from '../defaults'
import {Hermit} from '../types'

const PotatoBoyCommon: Hermit = {
	...hermit,
	id: 'potatoboy_common',
	numericId: 1241,
	name: 'Potatoboy',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['terraform'],
	health: 300,
	primary: {
		name: 'Fast',
		cost: ['terraform'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Furihorse',
		cost: ['terraform', 'terraform'],
		damage: 80,
		power: null,
	},
}

export default PotatoBoyCommon
