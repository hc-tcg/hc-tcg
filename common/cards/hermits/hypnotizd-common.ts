import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const HypnotizdCommon: Hermit = {
	...hermit,
	id: 'hypnotizd_common',
	numericId: 36,
	name: 'Hypno',
	expansion: 'default',
	rarity: 'common',
	tokens: 1,
	type: 'balanced',
	health: 250,
	primary: {
		name: 'What Up',
		cost: ['balanced'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Max Attack',
		cost: ['balanced', 'balanced', 'balanced'],
		damage: 100,
		power: null,
	},
}

export default HypnotizdCommon
