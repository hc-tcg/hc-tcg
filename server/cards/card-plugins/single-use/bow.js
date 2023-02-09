import SingleUseCard from './_single-use-card'

class BowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bow',
			name: 'Bow',
			rarity: 'common',
			description:
				'Does +40hp damage to any opposing AFK Hermit.\n\nDiscard after use.',
		})
		this.damage = {afkTarget: 40}
		this.reqsOn = 'attack'
		this.reqs = [{target: 'opponent', type: 'hermit', amount: 1, active: false}]
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {singleUseInfo} = derivedState
			if (singleUseInfo?.id === this.id && !target.isActive) {
				target.damage += this.damage.afkTarget
			}
			return target
		})
	}
}

export default BowSingleUseCard
