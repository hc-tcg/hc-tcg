import SingleUseCard from './_single-use-card'

class TNTSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'tnt',
			name: 'TNT',
			rarity: 'common',
			description:
				'Does +60hp damage to opposing Hermit.\n\nAlso does +20hp damage to user.\n\nDiscard after use.',
		})
		this.damage = {target: 60, self: 20}

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {singleUseInfo} = derivedState
			if (singleUseInfo?.id === this.id && target.isActive) {
				target.damage += this.damage.target
				target.backlash += this.damage.self
			}
			return target
		})
	}
}

export default TNTSingleUseCard
