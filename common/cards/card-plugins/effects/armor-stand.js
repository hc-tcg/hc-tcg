import EffectCard from './_effect-card'

class ArmorStandEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'armor_stand',
			name: 'Armor Stand',
			rarity: 'ultra_rare',
			description:
				"Use like a Hermit card. Has 50hp.\n\nCan not attack. Can not attach cards to it.\nOpponent does not get a point when it's knocked out.",
		})
	}
}
