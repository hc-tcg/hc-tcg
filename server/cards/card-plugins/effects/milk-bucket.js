import EffectCard from './_effect-card'

class MilkBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'milk_bucket',
			name: 'Milk Bucket',
			rarity: 'common',
			description:
				'Stops POISON.\n\nCan be used on active or AFK Hermits. Discard after Use.\n\nCan also be attached to prevent POISON.\n\nDiscard after user is knocked out.',
		})
		this.reqsOn = 'apply'
		this.reqs = [{target: 'player', type: 'hermit', amount: 1}]
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedCardsInfo} = derivedState
			if (singleUseInfo.id === this.id) {
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards?.length !== 1) return 'INVALID'
				const {row} = suPickedCards[0]
				row.ailments = row.ailments.filter((a) => a !== 'poison')
				return 'DONE'
			}
		})
	}
}

export default MilkBucketEffectCard
