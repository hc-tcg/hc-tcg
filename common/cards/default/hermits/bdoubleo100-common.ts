import HermitCard from '../../base/hermit-card'

class BdoubleO100CommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'bdoubleo100_common',
			numericId: 0,
			name: 'Bdubs',
			rarity: 'common',
			hermitType: 'builder',
			health: 260,
			primary: {
				name: 'Gradient',
				cost: ['builder'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Prettystone',
				cost: ['builder', 'builder'],
				damage: 80,
				power: null,
			},
		})
	}
}

export default BdoubleO100CommonHermitCard
