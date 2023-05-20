import HermitCard from './_hermit-card'

class XBCraftedCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xbcrafted_common',
			name: 'XB',
			rarity: 'common',
			hermitType: 'pvp',
			health: 270,
			primary: {
				name: 'Aww Yeah',
				cost: ['pvp'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Blam!',
				cost: ['pvp', 'pvp'],
				damage: 80,
				power: null,
			},
		})
	}

	register(game) {}
}

export default XBCraftedCommonHermitCard
