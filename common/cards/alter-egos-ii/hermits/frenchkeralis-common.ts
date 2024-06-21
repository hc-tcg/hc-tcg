import HermitCard from '../../base/hermit-card'

class FrenchKeralisCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'frenchkeralis_common',
			numericId: 231,
			name: 'Frenchralis',
			rarity: 'common',
			hermitType: 'explorer',
			health: 290,
			primary: {
				name: 'Bonjour',
				cost: ['explorer'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'La Baguette',
				cost: ['explorer', 'explorer'],
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

export default FrenchKeralisCommonHermitCard
