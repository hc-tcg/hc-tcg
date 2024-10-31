import {hermit} from '../defaults'
import {Hermit} from '../types'

const Iskall85Common: Hermit = {
	...hermit,
	id: 'iskall85_common',
	numericId: 47,
	name: 'Iskall',
	expansion: 'default',
	rarity: 'common',
	tokens: 1,
	type: ['balanced'],
	health: 280,
	primary: {
		name: 'Hallo',
		cost: ['balanced'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Omega',
		cost: ['balanced', 'balanced', 'balanced'],
		damage: 100,
		power: null,
	},
}

export default Iskall85Common
