
import HermitCard from './_hermit-card'

class XisumavoidCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xisumavoid_common',
			name: 'Xisuma',
			rarity: 'common',
			hermitType: 'farm',
			health: 300,
			primary: {
				name: "Oh My Days",
				cost: ["farm"],
				damage: 60,
				power: "null",
			},
			secondary: {
				name: "Jeez",
				cost: ["farm","farm","any"],
				damage: 90,
				power: "null",
			},
		})
	}

	register(game) {
	}
}

export default XisumavoidCommonHermitCard
