import HermitCard from '../../base/hermit-card'

class HorseHeadHypnoCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'horseheadhypno_common',
			numericId: 232,
			name: 'Horse Head Hypno',
			rarity: 'rare',
			hermitType: 'farm',
			health: 260,
			primary: {
				name: 'I.O.U.',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Profit',
				cost: ['farm', 'farm', 'farm'],
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

	override getShortName() {
		return 'H. H. Hypno'
	}
}

export default HorseHeadHypnoCommonHermitCard
