import EffectCard from './_effect-card'

class IronArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'iron_armor',
			name: 'Iron Armor',
			rarity: 'common',
			description:
				'Protects from the first +20hp damage taken.\n\nDiscard after user is knocked out.',
		})
		this.protection = {target: 20}
	}
	register(game) {}
}

export default IronArmorEffectCard
