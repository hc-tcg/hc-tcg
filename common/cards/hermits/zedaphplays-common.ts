import {hermit} from '../defaults'
import {Hermit} from '../types'

const ZedaphPlaysCommon: Hermit = {
	...hermit,
	id: 'zedaphplays_common',
	numericId: 54,
	name: 'Zedaph',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: ['redstone'],
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
