import {hermit} from '../defaults'
import {Hermit} from '../types'

const PrincessGemCommon: Hermit = {
	...hermit,
	id: 'princessgem_common',
	numericId: 408,
	name: 'Princess Gem',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'common',
	tokens: 1,
	type: ['terraform'],
	health: 280,
	primary: {
		name: 'Monarch',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Dawn',
		cost: ['terraform', 'terraform', 'terraform'],
		damage: 100,
		power: null,
	},
}

export default PrincessGemCommon
