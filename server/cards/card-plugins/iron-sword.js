class IronSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'effect_iron_sword',
			name: 'Iron Sword',
			rarity: 'common',
			description:
				'Does +20hp damage to opposing Hermit.\n\nDiscard after use.',
		})
		this.damage = {target: 20}
	}
	register(game) {
		game.hooks.attack(
			'IronSwordSingleUseCard',
			(turn, action, singleUseInfo) => {
				if (singleUseInfo.id === this.id) {
					return this.damage
				}
			}
		)
	}
}
