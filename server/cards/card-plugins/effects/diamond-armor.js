import EffectCard from './_effect-card'

class DiamondArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'diamond_armor',
			name: 'Diamond Armor',
			rarity: 'rare',
			description:
				'Protects from the first +30hp damage.\n\nDiscard after user is knocked out.',
		})
		this.protection = {target: 30}
	}
	register(game) {}
}

export default DiamondArmorEffectCard
