import EffectCard from './_effect-card'

class NetheriteArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'netherite_armor',
			name: 'Netherite Armor',
			rarity: 'ultra_rare',
			description:
				'Protects from the first +40hp damage.\n\nDiscard after user is knocked out.',
		})
		this.protection = {target: 40}
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

export default NetheriteArmorEffectCard
