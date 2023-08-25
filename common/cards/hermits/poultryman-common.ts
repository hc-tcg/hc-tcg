import HermitCard from '../base/hermit-card'

class PoultrymanCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'poultryman_common',
			name: 'Poultry Man',
			rarity: 'common',
			hermitType: 'prankster',
			health: 260,
			primary: {
				name: 'Eggscuse Me',
				cost: ['prankster'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Eggsplosion',
				cost: ['prankster', 'prankster'],
				damage: 80,
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

export default PoultrymanCommonHermitCard
