import {hermit} from '../defaults'
import {Hermit} from '../types'

const FiveAMPearlCommon: Hermit = {
	...hermit,
	id: 'fiveampearl_common',
	numericId: 182,
	name: '5AM Pearl',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: 'pvp',
	health: 280,
	primary: {
		name: 'Frozen Tickle',
		cost: ['pvp'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Unhinged',
		cost: ['pvp', 'pvp', 'any'],
		damage: 90,
		power: null,
	},
}

export default FiveAMPearlCommon
