import SingleUseCard from './_single-use-card'

class GoldenAxeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_axe',
			name: 'Golden Axe',
			rarity: 'rare',
			description:
				'Does +40hp damage.\n\nIgnores any attached Effect card.\n\nDiscard after use.',
		})
		this.damage = {target: 40}

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {singleUseInfo} = derivedState
			if (singleUseInfo?.id === this.id && target.isActive) {
				target.damage += this.damage.target
				target.ignoreEffects = true
			}
			return target
		})
	}
}

export default GoldenAxeSingleUseCard
