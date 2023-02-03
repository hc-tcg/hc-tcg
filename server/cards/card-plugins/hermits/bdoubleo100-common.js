import HermitCard from './_hermit-card'

class BdoubleO100CommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'bdoubleo100_common',
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

	register(game) {}
}

export default BdoubleO100CommonHermitCard
