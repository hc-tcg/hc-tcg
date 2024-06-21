import HermitCard from '../../base/hermit-card'

class OriginalXbCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'originalxb_common',
			numericId: 234,
			name: 'Original xB',
			rarity: 'common',
			hermitType: 'miner',
			health: 280,
			primary: {
				name: 'Hellooo?',
				cost: ['miner'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'So Good',
				cost: ['miner', 'miner', 'miner'],
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

export default OriginalXbCommonHermitCard
