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
		this.pickOn = 'attack'
		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: false},
		]
		this.pickReqs = this.useReqs
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {singleUseInfo, pickedCardsInfo} = derivedState
			if (singleUseInfo?.id !== this.id) return
			if (target.isActive) return

			// only attack selected afk target
			const bowPickedCards = pickedCardsInfo[this.id] || []
			if (bowPickedCards.length !== 1) return target
			const pickedHermit = bowPickedCards[0]
			if (pickedHermit.row !== target.row) return target

			target.extraEffectDamage += this.damage.afkTarget

			return target
		})
	}
}

export default BowSingleUseCard
