import HermitCard from '../../base/hermit-card'

class DwarfImpulseCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'dwarfimpulse_common',
			numericId: 229,
			name: 'Dwarf Impulse',
			rarity: 'common',
			type: 'farm',
			health: 250,
			primary: {
				name: 'Beard Bash',
				cost: ['farm'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Diggy Diggy',
				cost: ['farm', 'any'],
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
		return 'D. Impulse'
	}
}

export default DwarfImpulseCommonHermitCard
