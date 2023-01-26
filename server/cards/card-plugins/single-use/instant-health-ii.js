import SingleUseCard from './_single-use-card'

class InstantHealthIISingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health_ii',
			name: 'Instant Health II',
			rarity: 'rare',
			description:
				'Heals +60hp.\n\nCan be used on active or AFK Hermits. Discard after use.',
		})
		this.heal = 60
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedCardsInfo} = derivedState
			if (singleUseInfo?.id === this.id) {
				if (pickedCardsInfo?.length !== 1) return 'INVALID'
				const {row, cardInfo} = pickedCardsInfo[0]
				row.health = Math.min(
					row.health + this.heal,
					cardInfo.health // max health
				)
				return 'DONE'
			}
		})
	}
}

export default InstantHealthIISingleUseCard
