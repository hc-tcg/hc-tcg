import {hermit} from '../defaults'
import {Hermit} from '../types'

const EvilXisumaCommon: Hermit = {
	...hermit,
	id: 'evilxisuma_common',
	numericId: 1227,
	name: 'Evil X',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['redstone'],
	health: 290,
	primary: {
		name: 'Minion',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Withermen',
		cost: ['redstone', 'redstone', 'any'],
		damage: 90,
		power: null,
	},
}

export default EvilXisumaCommon
