import SingleUseCard from './_single-use-card'

class NetheriteSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'netherite_sword',
			name: 'Netherite Sword',
			rarity: 'ultra_rare',
			description:
				'Does +60hp damage to opposing Hermit.\n\nDiscard after use.',
		})
		this.damage = {target: 60}

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

export default NetheriteSwordSingleUseCard
