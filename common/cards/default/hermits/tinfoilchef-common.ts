import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class TinFoilChefCommonHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'tinfoilchef_common',
		numericId: 97,
		name: 'TFC',
		rarity: 'common',
		tokens: 0,
		expansion: 'default',
		type: 'miner',
		health: 290,
		primary: {
			name: '=π',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Alright',
			cost: ['miner', 'miner', 'any'],
			damage: 90,
			power: null,
		},
	}
}

export default TinFoilChefCommonHermitCard
