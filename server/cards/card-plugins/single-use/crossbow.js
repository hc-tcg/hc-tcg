import SingleUseCard from './_single-use-card'

class CrossbowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'crossbow',
			name: 'Crossbow',
			rarity: 'rare',
			description:
				"Does +40hp damage to opposing Hermit and +10hp damage to AFK Hermit of player's choice.\n\nDiscard after use.",
		})
		this.damage = {target: 40, afkTarget: 10}

		this.pickOn = 'attack'
		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
		this.pickReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: false},
		]
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {singleUseInfo} = derivedState
			if (singleUseInfo?.id === this.id) {
				target.damage += target.isActive
					? this.damage.target
					: this.damage.afkTarget
			}
			return target
		})
	}
}

export default CrossbowSingleUseCard
