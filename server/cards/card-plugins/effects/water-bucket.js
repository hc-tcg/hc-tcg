import EffectCard from './_effect-card'

class WaterBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'water_bucket',
			name: 'Water Bucket',
			rarity: 'common',
			description:
				'Stops BURN.\n\nCan be used on active or AFK Hermits. Discard after Use.\n\nCan also be attached to prevent BURN.\n\nDiscard after user is knocked out.',
		})
		this.pickOn = 'apply'
		this.pickReqs = [{target: 'player', type: 'hermit', amount: 1}]
	}

	register(game) {
		game.hooks.actionEnd.tap(this.id, (action, derivedState) => {
			const {currentPlayer, opponentPlayer} = derivedState
			const allRows = [
				...currentPlayer.board.rows,
				...opponentPlayer.board.rows,
			]
			allRows.forEach((row) => {
				const onFire = row.ailments.some((a) => a.id === 'fire')
				const hasBucket = row.effectCard?.cardId === this.id
				if (onFire && hasBucket) {
					row.ailments = row.ailments.filter((a) => a.id !== 'fire')
				}
			})
		})

		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedCardsInfo} = derivedState
			if (singleUseInfo.id === this.id) {
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards?.length !== 1) return 'INVALID'
				const {row} = suPickedCards[0]
				row.ailments = row.ailments.filter((a) => a.id !== 'fire')
				return 'DONE'
			}
		})
	}
}

export default WaterBucketEffectCard
