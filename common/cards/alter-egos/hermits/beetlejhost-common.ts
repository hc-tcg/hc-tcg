import HermitCard from '../../base/hermit-card'

class BeetlejhostCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'beetlejhost_common',
			numericId: 126,
			name: 'Beetlejhost',
			rarity: 'common',
			type: 'speedrunner',
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

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default BeetlejhostCommonHermitCard
