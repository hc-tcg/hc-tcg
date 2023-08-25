import HermitCard from '../base/hermit-card'

class TinFoilChefCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tinfoilchef_common',
			numeric_id: 97,
			name: 'TFC',
			rarity: 'common',
			hermitType: 'miner',
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
		})
	}
}

export default TinFoilChefCommonHermitCard
