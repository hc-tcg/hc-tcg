import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const ZedaphPlaysCommon: Hermit = {
	...hermit,
	id: 'zedaphplays_common',
	numericId: 113,
	name: 'Zedaph',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'redstone',
	health: 250,
	primary: {
		name: 'For Science',
		cost: ['redstone'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Hadjah!',
		cost: ['redstone', 'any'],
		damage: 70,
		power: null,
	},
}

export default ZedaphPlaysCommon
