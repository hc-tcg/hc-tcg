import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const StressMonster101Common: Hermit = {
	...hermit,
	id: 'stressmonster101_common',
	numericId: 92,
	name: 'Stress',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'builder',
	health: 280,
	primary: {
		name: "'Ello",
		cost: ['builder'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Geezer',
		cost: ['builder', 'builder'],
		damage: 80,
		power: null,
	},
}

export default StressMonster101Common