import SingleUseCard from './_single-use-card'

class GoldenAppleSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_apple',
			name: 'Golden Apple',
			rarity: 'ultra_rare',
			description:
				'Heals +100hp.\n\nCan be used on active or AFK Hermits.\n\nDiscard after use.',
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedRow, pickedCardInfo} = derivedState
			if (singleUseInfo?.id === this.id) {
				pickedRow.health = Math.min(
					pickedRow.health + 100,
					pickedCardInfo.health // max health
				)
				return 'DONE'
			}
		})
	}
}

export default GoldenAppleSingleUseCard
