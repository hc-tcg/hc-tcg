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
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedRow} = derivedState
			if (singleUseInfo.id === this.id) {
				if (pickedRow === null) return 'INVALID'
				pickedRow.ailments = pickedRow.ailments.filter((a) => a !== 'fire')
				return 'DONE'
			}
		})
	}
}

export default WaterBucketEffectCard
