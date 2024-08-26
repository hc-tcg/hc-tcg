import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const Docm77Common: Hermit = {
	...hermit,
	id: 'docm77_common',
	numericId: 15,
	name: 'Docm77',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'redstone',
	health: 260,
	primary: {
		name: 'Hive Mind',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'G.O.A.T.',
		cost: ['redstone', 'any'],
		damage: 70,
		power: null,
	},
}

export default Docm77Common
