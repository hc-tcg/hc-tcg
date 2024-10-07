import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const ImpulseSVCommon: Hermit = {
	...hermit,
	id: 'impulsesv_common',
	numericId: 40,
	name: 'Impulse',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'farm',
	health: 270,
	primary: {
		name: 'Shovel Shuffle',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'iAttack',
		cost: ['farm', 'any'],
		damage: 70,
		power: null,
	},
}

export default ImpulseSVCommon
