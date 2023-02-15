import SingleUseCard from './_single-use-card'

class IronSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'iron_sword',
			name: 'Iron Sword',
			rarity: 'common',
			description:
				'Does +20hp damage to opposing Hermit.\n\nDiscard after use.',
		})
		this.damage = {target: 20}

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {singleUseInfo} = derivedState
			if (singleUseInfo?.id === this.id && target.isActive) {
				target.damage += this.damage.target
			}
			return target
		})
	}
}

export default IronSwordSingleUseCard
