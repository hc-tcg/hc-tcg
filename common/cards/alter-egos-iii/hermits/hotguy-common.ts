import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const HotguyCommon: Hermit = {
	...hermit,
	id: 'hotguy_common',
	numericId: 159,
	name: 'Hotguy',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: 'speedrunner',
	health: 300,
	primary: {
		name: '6-Pack',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Spray on Tan',
		cost: ['speedrunner', 'speedrunner', 'any'],
		damage: 90,
		power: null,
	},
}

export default HotguyCommon
