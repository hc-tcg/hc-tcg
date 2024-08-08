import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const IJevinCommon: Hermit = {
	...hermit,
	id: 'ijevin_common',
	numericId: 38,
	name: 'Jevin',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'explorer',
	health: 250,
	primary: {
		name: "Got 'Em",
		cost: ['explorer'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Jevination',
		cost: ['explorer', 'explorer', 'any'],
		damage: 90,
		power: null,
	},
}

export default IJevinCommon
