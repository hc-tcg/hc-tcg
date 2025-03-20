import {hermit} from '../defaults'
import {Hermit} from '../types'

const SpookyStressCommon: Hermit = {
	...hermit,
	id: 'spookystress_common',
	numericId: 811,
	name: 'Spooky Stress',
	shortName: 'S. Stress',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['pvp'],
	health: 260,
	primary: {
		name: 'Giggle',
		cost: ['pvp'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Mingin',
		cost: ['pvp', 'pvp', 'any'],
		damage: 90,
		power: null,
	},
}

export default SpookyStressCommon
