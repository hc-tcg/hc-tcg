import HermitCard from '../../base/hermit-card'

class ArchitectFalseCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'architectfalse_common',
			numericId: 227,
			name: 'Grand Architect',
			rarity: 'common',
			hermitType: 'speedrunner',
			health: 270,
			primary: {
				name: 'Oxidize',
				cost: ['speedrunner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Crossover',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power: null,
			},
		})
	}

	override getExpansion() {
		return 'alter_egos_ii'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}

	override getShortName() {
		return 'G. Architect'
	}
}

export default ArchitectFalseCommonHermitCard
