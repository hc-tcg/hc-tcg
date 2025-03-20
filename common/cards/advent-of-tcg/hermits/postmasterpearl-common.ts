import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const PostmasterPearlCommon: Hermit = {
	...hermit,
	id: 'postmasterpearl_common',
	numericId: 1404,
	name: 'Postmaster Pearl',
	shortName: 'Postmaster',
	expansion: 'hc_plus',
	palette: 'advent_of_tcg_ii',
	background: 'advent_of_tcg_ii',
	rarity: 'common',
	tokens: 0,
	type: ['builder'],
	health: 290,
	primary: {
		name: 'Delivery',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Mail Box',
		cost: ['builder', 'builder', 'builder'],
		damage: 100,
		power: null,
	},
}

export default PostmasterPearlCommon
