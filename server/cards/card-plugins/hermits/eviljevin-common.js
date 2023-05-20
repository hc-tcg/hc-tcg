import HermitCard from './_hermit-card'

class EvilJevinCommonHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'eviljevin_common',
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
			palette: 'alter_egos',
			background: 'alter_egos_background',
		})
	}

	register(game) {}
}

export default EvilJevinCommonHermitCard
