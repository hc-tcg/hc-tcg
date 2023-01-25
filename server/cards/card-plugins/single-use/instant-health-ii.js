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
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedRow, pickedCardInfo} = derivedState
			if (singleUseInfo?.id === this.id) {
				pickedRow.health = Math.min(
					pickedRow.health + 60,
					pickedCardInfo.health // max health
				)
				return 'DONE'
			}
		})
	}
}

export default InstantHealthIISingleUseCard
