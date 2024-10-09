import {hermit} from '../defaults'
import {Hermit} from '../types'

const WelsknightCommon: Hermit = {
	...hermit,
	id: 'welsknight_common',
	numericId: 106,
	name: 'Wels',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'builder',
	health: 300,
	primary: {
		name: 'Chivalry',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Judgement',
		cost: ['builder', 'builder', 'any'],
		damage: 90,
		power: null,
	},
}

export default WelsknightCommon
