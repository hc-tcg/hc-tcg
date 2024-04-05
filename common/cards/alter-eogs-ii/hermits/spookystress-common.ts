import HermitCard from '../../base/hermit-card'

class SpookyStressCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'spookystress_common',
			numericId: 238,
			name: 'S. Stress',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 260,
			primary: {
				name: 'Giggle',
				cost: ['pvp'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Mingin',
				cost: ['pvp', 'pvp', 'any'],
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

export default SpookyStressCommonHermitCard
