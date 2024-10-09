import {hermit} from '../defaults'
import {Hermit} from '../types'

const XisumavoidCommon: Hermit = {
	...hermit,
	id: 'xisumavoid_common',
	numericId: 111,
	name: 'Xisuma',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'farm',
	health: 300,
	primary: {
		name: 'Oh My Days',
		cost: ['farm'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Jeez',
		cost: ['farm', 'farm', 'any'],
		damage: 90,
		power: null,
	},
}

export default XisumavoidCommon
