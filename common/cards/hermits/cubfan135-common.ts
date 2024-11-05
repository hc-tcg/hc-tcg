import {hermit} from '../defaults'
import {Hermit} from '../types'

const Cubfan135Common: Hermit = {
	...hermit,
	id: 'cubfan135_common',
	numericId: 8,
	name: 'Cub',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: ['balanced'],
	health: 290,
	primary: {
		name: 'Heyo',
		cost: ['balanced'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Vex Magic',
		cost: ['balanced', 'any'],
		damage: 70,
		power: null,
	},
}

export default Cubfan135Common
