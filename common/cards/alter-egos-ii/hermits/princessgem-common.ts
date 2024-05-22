import HermitCard from '../../base/hermit-card'

class PrincessGemCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'princessgem_common',
			numericId: 236,
			name: 'Princess Gem',
			rarity: 'common',
			hermitType: 'terraform',
			health: 280,
			primary: {
				name: 'Monarch',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Dawn',
				cost: ['terraform', 'terraform', 'terraform'],
				damage: 100,
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

export default PrincessGemCommonHermitCard
