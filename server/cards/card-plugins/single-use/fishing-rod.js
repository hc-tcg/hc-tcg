import SingleUseCard from './_single-use-card'

class FishingRodSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fishing_rod',
			name: 'Fishing Rod',
			rarity: 'ultra_rare',
			description: 'Player draws 2 cards from deck.\n\nDiscard after use.',
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, () => {
			const {singleUseInfo, currentPlayer} = game.ds
			if (singleUseInfo?.id === this.id) {
				for (let i = 0; i < 2; i++) {
					const drawCard = currentPlayer.pile.shift()
					if (drawCard) currentPlayer.hand.push(drawCard)
				}
				return 'DONE'
			}
		})
	}
}

export default FishingRodSingleUseCard
