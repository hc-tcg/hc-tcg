import {hermit} from '../defaults'
import {Hermit} from '../types'

const FrenchKeralisCommon: Hermit = {
	...hermit,
	id: 'frenchkeralis_common',
	numericId: 803,
	name: 'Frenchralis',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['explorer'],
	health: 290,
	primary: {
		name: 'Bonjour',
		cost: ['explorer'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'La Baguette',
		cost: ['explorer', 'explorer'],
		damage: 80,
		power: null,
	},
}

export default FrenchKeralisCommon
