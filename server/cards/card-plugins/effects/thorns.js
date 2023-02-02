import EffectCard from './_effect-card'

class ThornsEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns',
			name: 'Thorns',
			rarity: 'common',
			description:
				'Opposing Hermit takes +10hp damage after attack.\n\nDiscard after user is knocked out.',
		})
		this.protection = {backlash: 10}
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			if (target.effectCardId === this.id) {
				target.counter += this.protection.backlash
			}
			return target
		})
	}
}

export default ThornsEffectCard
