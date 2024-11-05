import {hermit} from '../defaults'
import {Hermit} from '../types'

const KingJoelCommon: Hermit = {
	...hermit,
	id: 'kingjoel_common',
	numericId: 1239,
	name: 'King Joel',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	type: ['terraform'],
	health: 290,
	primary: {
		name: 'Clone',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Ignore',
		cost: ['terraform', 'terraform', 'any'],
		damage: 90,
		power: null,
	},
}

export default KingJoelCommon
