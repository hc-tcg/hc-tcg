import HermitCard from './_hermit-card'

class BeetlejhostCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'beetlejhost_common',
			name: 'Beetlejhost',
			rarity: 'common',
			hermitType: 'speedrunner',
			health: 290,
			primary: {
				name: 'Expand',
				cost: ['speedrunner'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Chroma',
				cost: ['speedrunner', 'speedrunner', 'speedrunner'],
				damage: 100,
				power: null,
			},
		})
	}

	getExpansion() {
		return 'alter_egos'
	}

	getPalette() {
		return 'alter_egos'
	}

	getBackground() {
		return 'alter_egos_background'
	}
}

export default BeetlejhostCommonHermitCard
