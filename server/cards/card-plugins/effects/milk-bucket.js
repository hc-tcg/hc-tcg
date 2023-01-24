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
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedRow} = derivedState
			if (singleUseInfo.id === this.id) {
				if (pickedRow === null) return 'INVALID'
				pickedRow.ailments = pickedRow.ailments.filter((a) => a !== 'poison')
				return 'DONE'
			}
		})
	}
}

export default MilkBucketEffectCard
