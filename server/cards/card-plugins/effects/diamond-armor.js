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
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			if (target.effectCardId === this.id) {
				target.protection += this.protection.target
			}
			if (target.attackerEffectCardId === this.id) {
				target.attackerProtection += this.protection.target
			}
			return target
		})
	}
}

export default DiamondArmorEffectCard
