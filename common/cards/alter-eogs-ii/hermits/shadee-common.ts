import HermitCard from '../../base/hermit-card'

class ShadEECommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'shadee_common',
			numericId: 237,
			name: 'Shade-E-E',
			rarity: 'rare',
			hermitType: 'prankster',
			health: 280,
			primary: {
				name: 'Free Glass',
				cost: ['any'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Tickle',
				cost: ['prankster', 'prankster', 'any'],
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
}

export default ShadEECommonHermitCard
