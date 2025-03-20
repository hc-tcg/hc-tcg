import {hermit} from '../defaults'
import {Hermit} from '../types'

const RendogCommon: Hermit = {
	...hermit,
	id: 'rendog_common',
	numericId: 86,
	name: 'Rendog',
	expansion: 'default',
	rarity: 'common',
	tokens: 1,
	type: 'balanced',
	health: 260,
	primary: {
		name: 'Professional',
		cost: ['balanced'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Outrageous',
		cost: ['balanced', 'balanced', 'balanced'],
		damage: 100,
		power: null,
	},
}

export default RendogCommon
