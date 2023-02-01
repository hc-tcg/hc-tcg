import SingleUseCard from './_single-use-card'

class InstantHealthSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health',
			name: 'Instant Health',
			rarity: 'common',
			description:
				'Heals +30hp.\n\nCan be used on active or AFK Hermits.\n\nDiscard after use.',
		})
		this.heal = 30
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedCardsInfo} = derivedState
			if (singleUseInfo?.id === this.id) {
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards.length !== 1) return 'INVALID'
				const {row, cardInfo} = suPickedCards[0]
				row.health = Math.min(
					row.health + this.heal,
					cardInfo.health // max health
				)
				return 'DONE'
			}
		})
	}
}

export default InstantHealthSingleUseCard
