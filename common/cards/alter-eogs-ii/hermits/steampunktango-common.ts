import HermitCard from '../../base/hermit-card'

class SteampunkTangoCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'steampunktango_common',
			numericId: 239,
			name: 'S. Tango',
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
				cost: ['speedrunner', 'speedrunner'],
				damage: 80,
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
}

export default SteampunkTangoCommonHermitCard
