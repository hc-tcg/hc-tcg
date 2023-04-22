import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class SadDoggoSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'sad_doggo',
			name: 'Sad Doggo',
			rarity: 'rare',
			description: 'Player draws 2 cards from deck.\n\nDiscard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 */
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

export default SadDoggoSingleUseCard
