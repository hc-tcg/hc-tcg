import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const PotatoBoyCommon: Hermit = {
	...hermit,
	id: 'potatoboy_common',
	numericId: 177,
	name: 'Potatoboy',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: 'terraform',
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
