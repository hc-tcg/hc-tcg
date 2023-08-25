import HermitCard from '../base/hermit-card'

class EvilJevinCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'eviljevin_common',
			numeric_id: 127,
			name: 'Evil Jevin',
			rarity: 'common',
			hermitType: 'miner',
			health: 260,
			primary: {
				name: 'Pickle',
				cost: ['miner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Slime',
				cost: ['miner', 'miner', 'any'],
				damage: 90,
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

export default EvilJevinCommonHermitCard
