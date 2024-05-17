import HermitCard from '../../base/hermit-card'

class SteampunkTangoCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'steampunktango_common',
			numericId: 239,
			name: 'Steampunk Tango',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 250,
			primary: {
				name: 'Create',
				cost: ['speedrunner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Automate',
				cost: ['speedrunner', 'any'],
				damage: 70,
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
		return 'S. Tango'
	}
}

export default SteampunkTangoCommonHermitCard
