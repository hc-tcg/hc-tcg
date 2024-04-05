import HermitCard from '../../base/hermit-card'

class WormManCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'wormman_common',
			numericId: 240,
			name: 'Worm Man',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 260,
			primary: {
				name: 'Justice!',
				cost: ['terraform', 'terraform'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Away!',
				cost: ['terraform', 'terraform', 'any'],
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

export default WormManCommonHermitCard
