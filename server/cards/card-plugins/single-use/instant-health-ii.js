import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

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
		this.pickOn = 'apply'
		this.useReqs = [{target: 'player', type: 'hermit', amount: 1}]
		this.pickReqs = this.useReqs
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, actionState) => {
			const {singleUseInfo} = game.ds
			const {pickedCardsInfo} = actionState
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

export default InstantHealthIISingleUseCard
