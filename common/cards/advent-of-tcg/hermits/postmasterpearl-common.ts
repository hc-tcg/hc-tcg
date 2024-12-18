import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const PostmasterPearlCommon: Hermit = {
	...hermit,
	id: 'postmasterpearl_common',
	numericId: 258,
	name: 'Postmaster Pearl',
	expansion: 'advent_of_tcg_ii',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	type: 'builder',
	health: 290,
	primary: {
		name: 'Post inspector',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Stamp',
		cost: ['builder', 'builder', 'builder'],
		damage: 100,
		power: null,
	},
}

export default PostmasterPearlCommon
